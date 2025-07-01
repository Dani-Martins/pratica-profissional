using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;

namespace SistemaEmpresa.Repositories
{
    // Adicione esta classe estática no início do arquivo
    public static class MySqlExtensions
    {
        public static bool HasColumn(this MySqlDataReader reader, string columnName)
        {
            for (int i = 0; i < reader.FieldCount; i++)
            {
                if (reader.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }
    }

    public class TransportadoraRepository
    {
        private readonly MySqlConnection _connection;

        public TransportadoraRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<Transportadora>> ReadAll()
        {
            var transportadoras = new List<Transportadora>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT t.*, c.nome as cidade_nome, c.estado_id,
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf,
                           p.id as pais_id, p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla
                    FROM transportadora t
                    LEFT JOIN cidade c ON t.cidade_id = c.id
                    LEFT JOIN estado e ON c.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE t.ativo = 1
                    ORDER BY t.razao_social", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    transportadoras.Add(MapearTransportadora(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return transportadoras;
        }

        public async Task<Transportadora?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT t.*, c.nome as cidade_nome, c.estado_id,
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf,
                           p.id as pais_id, p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla
                    FROM transportadora t
                    LEFT JOIN cidade c ON t.cidade_id = c.id
                    LEFT JOIN estado e ON c.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE t.id = @id AND t.ativo = 1", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearTransportadora(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Create(Transportadora transportadora)
        {
            try
            {
                await _connection.OpenAsync();
                
                // Modificar a consulta SQL para incluir apenas colunas que existem no banco de dados
                using var command = new MySqlCommand(@"
                    INSERT INTO transportadora (
                        razao_social, nome_fantasia, cnpj,
                        email, telefone, endereco, cidade_id, ativo
                    ) VALUES (
                        @razaoSocial, @nomeFantasia, @cnpj,
                        @email, @telefone, @endereco, @cidadeId, @ativo
                    )", _connection);
                
                command.Parameters.AddWithValue("@razaoSocial", transportadora.RazaoSocial);
                command.Parameters.AddWithValue("@nomeFantasia", transportadora.NomeFantasia ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@cnpj", transportadora.CNPJ);
                command.Parameters.AddWithValue("@email", transportadora.Email ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@telefone", transportadora.Telefone ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@endereco", transportadora.Endereco ?? string.Empty);
                command.Parameters.AddWithValue("@cidadeId", transportadora.CidadeId ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@ativo", transportadora.Ativo);
                
                var result = await command.ExecuteNonQueryAsync();
                
                // Se inserido com sucesso, obtenha o ID gerado
                if (result > 0)
                {
                    transportadora.Id = (int)command.LastInsertedId;
                    return true;
                }
                
                return false;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, Transportadora transportadora)
        {
            try
            {
                await _connection.OpenAsync();

                if (transportadora.CidadeId.HasValue)
                {
                    // Verifica se a cidade existe
                    using var checkCommand = new MySqlCommand(
                        "SELECT COUNT(*) FROM cidade WHERE id = @cidadeId", 
                        _connection);
                    
                    checkCommand.Parameters.AddWithValue("@cidadeId", transportadora.CidadeId.Value);
                    var cidadeExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;

                    if (!cidadeExists)
                        throw new InvalidOperationException($"Cidade com ID {transportadora.CidadeId} não encontrada");
                }

                using var command = new MySqlCommand(@"
                    UPDATE transportadora 
                    SET razao_social = @razaoSocial,
                        nome_fantasia = @nomeFantasia,
                        cnpj = @cnpj,
                        email = @email,
                        telefone = @telefone,
                        endereco = @endereco,
                        numero = @numero,
                        complemento = @complemento,
                        bairro = @bairro,
                        cep = @cep,
                        cidade_id = @cidadeId,
                        ativo = @ativo
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, transportadora);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Delete(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    UPDATE transportadora 
                    SET ativo = 0 
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        private void PreencherParametros(MySqlCommand command, Transportadora transportadora)
        {
            command.Parameters.AddWithValue("@razaoSocial", transportadora.RazaoSocial);
            command.Parameters.AddWithValue("@nomeFantasia", 
                transportadora.NomeFantasia ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@cnpj", transportadora.CNPJ);
            command.Parameters.AddWithValue("@telefone", 
                transportadora.Telefone ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@email", 
                transportadora.Email ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@endereco", transportadora.Endereco);
            command.Parameters.AddWithValue("@numero", transportadora.Numero);
            command.Parameters.AddWithValue("@complemento", 
                transportadora.Complemento ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@bairro", transportadora.Bairro);
            command.Parameters.AddWithValue("@cep", transportadora.Cep);
            command.Parameters.AddWithValue("@cidadeId", 
                transportadora.CidadeId.HasValue ? transportadora.CidadeId.Value : (object)DBNull.Value);
            command.Parameters.AddWithValue("@ativo", transportadora.Ativo);
        }

        private Transportadora MapearTransportadora(MySqlDataReader reader)
        {
            var transportadora = new Transportadora
            {
                Id = reader.GetInt32("id"),
                RazaoSocial = reader.GetString("razao_social"),
                
                // Verifique se os campos são null
                NomeFantasia = reader.IsDBNull(reader.GetOrdinal("nome_fantasia")) 
                    ? null 
                    : reader.GetString("nome_fantasia"),
                    
                // CNPJ pode ser requerido, mas verifique mesmo assim
                CNPJ = reader.IsDBNull(reader.GetOrdinal("cnpj")) 
                    ? string.Empty 
                    : reader.GetString("cnpj"),
                    
                Email = reader.IsDBNull(reader.GetOrdinal("email")) 
                    ? null 
                    : reader.GetString("email"),
                    
                Telefone = reader.IsDBNull(reader.GetOrdinal("telefone")) 
                    ? null 
                    : reader.GetString("telefone"),
                    
                Endereco = reader.IsDBNull(reader.GetOrdinal("endereco")) 
                    ? string.Empty 
                    : reader.GetString("endereco"),
                    
                // Verifique os novos campos que podem ser null
                Numero = reader.HasColumn("numero") 
                    ? (reader.IsDBNull(reader.GetOrdinal("numero")) ? string.Empty : reader.GetString("numero"))
                    : string.Empty,
                    
                Complemento = reader.HasColumn("complemento") 
                    ? (reader.IsDBNull(reader.GetOrdinal("complemento")) ? null : reader.GetString("complemento"))
                    : null,
                    
                Bairro = reader.HasColumn("bairro") 
                    ? (reader.IsDBNull(reader.GetOrdinal("bairro")) ? string.Empty : reader.GetString("bairro"))
                    : string.Empty,
                    
                Cep = reader.HasColumn("cep") 
                    ? (reader.IsDBNull(reader.GetOrdinal("cep")) ? string.Empty : reader.GetString("cep"))
                    : string.Empty,
                    
                CidadeId = reader.IsDBNull(reader.GetOrdinal("cidade_id")) 
                    ? null 
                    : reader.GetInt64("cidade_id"),
                    
                Ativo = reader.GetBoolean("ativo")
            };

            // Cidade é uma propriedade de navegação - verificar se temos dados da cidade
            if (transportadora.CidadeId.HasValue && 
                reader.HasColumn("cidade_nome") && 
                !reader.IsDBNull(reader.GetOrdinal("cidade_nome")))
            {
                // Primeiro, tentar obter estado_id da coluna específica
                var estadoId = reader.HasColumn("estado_id") && !reader.IsDBNull(reader.GetOrdinal("estado_id")) 
                    ? reader.GetInt64("estado_id") 
                    : 0;
                    
                var estado = estadoId > 0 ? new Estado() : null;
                
                if (estado != null && 
                    reader.HasColumn("estado_nome") && 
                    !reader.IsDBNull(reader.GetOrdinal("estado_nome")))
                {
                    estado.Id = (int)estadoId;
                    estado.Nome = reader.GetString("estado_nome");
                    estado.UF = reader.HasColumn("estado_uf") && !reader.IsDBNull(reader.GetOrdinal("estado_uf"))
                        ? reader.GetString("estado_uf")
                        : "";
                    
                    // Código para preencher o País
                    if (reader.HasColumn("pais_id") && !reader.IsDBNull(reader.GetOrdinal("pais_id")))
                    {
                        var paisId = reader.GetInt64("pais_id");
                        estado.PaisId = (int)paisId;
                        
                        if (reader.HasColumn("pais_nome") && !reader.IsDBNull(reader.GetOrdinal("pais_nome")))
                        {
                            estado.Pais = new Pais
                            {
                                Id = (int)paisId,
                                Nome = reader.GetString("pais_nome"),
                                Codigo = reader.HasColumn("pais_codigo") && !reader.IsDBNull(reader.GetOrdinal("pais_codigo"))
                                    ? reader.GetString("pais_codigo")
                                    : null,
                                Sigla = reader.HasColumn("pais_sigla") && !reader.IsDBNull(reader.GetOrdinal("pais_sigla"))
                                    ? reader.GetString("pais_sigla")
                                    : null
                            };
                        }
                    }
                }
                
                transportadora.Cidade = new Cidade
                {
                    Id = transportadora.CidadeId.Value,
                    Nome = reader.GetString("cidade_nome"),
                    CodigoIBGE = reader.HasColumn("codigo_ibge") && !reader.IsDBNull(reader.GetOrdinal("codigo_ibge"))
                        ? reader.GetString("codigo_ibge")
                        : null,
                    EstadoId = estadoId,  // Definir o EstadoId aqui
                    Estado = estado       // E o objeto Estado aqui
                };
            }

            return transportadora;
        }
    }
}
