using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;

namespace SistemaEmpresa.Repositories
{
    public class VeiculoRepository
    {
        private readonly MySqlConnection _connection;

        public VeiculoRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<Veiculo>> ReadAll()
        {
            var veiculos = new List<Veiculo>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT v.*, 
                           t.id as transportadora_id, t.razao_social, t.nome_fantasia, t.cnpj,
                           t.email as transportadora_email, t.telefone as transportadora_telefone,
                           t.endereco as transportadora_endereco, t.cidade_id,
                           c.nome as cidade_nome, c.codigo_ibge as codigo_ibge,
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf,
                           p.id as pais_id, p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla
                    FROM veiculo v
                    LEFT JOIN transportadora t ON v.transportadora_id = t.id
                    LEFT JOIN cidade c ON t.cidade_id = c.id
                    LEFT JOIN estado e ON c.estado_id = e.id
                    LEFT JOIN pais p ON e.pais_id = p.id
                    WHERE v.ativo = 1
                    ORDER BY v.placa", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    veiculos.Add(MapearVeiculo(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return veiculos;
        }

        public async Task<Veiculo?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT v.*, t.razao_social, t.nome_fantasia 
                    FROM veiculo v
                    LEFT JOIN transportadora t ON v.transportadora_id = t.id 
                    WHERE v.id = @id AND v.ativo = 1", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearVeiculo(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Create(Veiculo veiculo)
        {
            try
            {
                await _connection.OpenAsync();

                if (veiculo.TransportadoraId.HasValue)
                {
                    using var checkCommand = new MySqlCommand(
                        "SELECT COUNT(*) FROM transportadora WHERE id = @transportadoraId", 
                        _connection);
                    
                    checkCommand.Parameters.AddWithValue("@transportadoraId", veiculo.TransportadoraId.Value);
                    var transportadoraExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;

                    if (!transportadoraExists)
                        throw new InvalidOperationException($"Transportadora com ID {veiculo.TransportadoraId} não encontrada");
                }

                using var command = new MySqlCommand(@"
                    INSERT INTO veiculo (
                        placa, modelo, marca,
                        ano, capacidade, transportadora_id,
                        ativo
                    ) VALUES (
                        @placa, @modelo, @marca,
                        @ano, @capacidade, @transportadoraId,
                        @ativo
                    )", _connection);
                
                PreencherParametros(command, veiculo);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, Veiculo veiculo)
        {
            try
            {
                await _connection.OpenAsync();

                if (veiculo.TransportadoraId.HasValue)
                {
                    using var checkCommand = new MySqlCommand(
                        "SELECT COUNT(*) FROM transportadora WHERE id = @transportadoraId", 
                        _connection);
                    
                    checkCommand.Parameters.AddWithValue("@transportadoraId", veiculo.TransportadoraId.Value);
                    var transportadoraExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;

                    if (!transportadoraExists)
                        throw new InvalidOperationException($"Transportadora com ID {veiculo.TransportadoraId} não encontrada");
                }

                using var command = new MySqlCommand(@"
                    UPDATE veiculo 
                    SET placa = @placa,
                        modelo = @modelo,
                        marca = @marca,
                        ano = @ano,
                        capacidade = @capacidade,
                        transportadora_id = @transportadoraId,
                        ativo = @ativo
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, veiculo);
                
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
                
                using var command = new MySqlCommand(
                    "UPDATE veiculo SET ativo = 0 WHERE id = @id", 
                    _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<IEnumerable<Veiculo>> ReadByTransportadoraId(long transportadoraId)
        {
            var veiculos = new List<Veiculo>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT v.*, t.razao_social, t.nome_fantasia 
                    FROM veiculo v
                    LEFT JOIN transportadora t ON v.transportadora_id = t.id 
                    WHERE v.transportadora_id = @transportadoraId AND v.ativo = 1", _connection);
                
                command.Parameters.AddWithValue("@transportadoraId", transportadoraId);
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    veiculos.Add(MapearVeiculo(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return veiculos;
        }

        private void PreencherParametros(MySqlCommand command, Veiculo veiculo)
        {
            command.Parameters.AddWithValue("@placa", veiculo.Placa);
            command.Parameters.AddWithValue("@modelo", veiculo.Modelo);
            command.Parameters.AddWithValue("@marca", veiculo.Marca ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@ano", veiculo.Ano ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@capacidade", veiculo.Capacidade ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@transportadoraId", 
                veiculo.TransportadoraId.HasValue ? veiculo.TransportadoraId.Value : (object)DBNull.Value);
            command.Parameters.AddWithValue("@ativo", veiculo.Ativo);
        }

        private Veiculo MapearVeiculo(MySqlDataReader reader)
        {
            var veiculo = new Veiculo
            {
                Id = reader.GetInt32("id"),
                Placa = reader.GetString("placa"),
                Modelo = reader.GetString("modelo"),
                Marca = reader.GetString("marca"),
                Ano = reader.GetInt32("ano"),
                Capacidade = reader.GetDecimal("capacidade"),
                TransportadoraId = reader.GetInt32("transportadora_id"),
                Ativo = reader.GetBoolean("ativo")
            };
            
            // Mapear a transportadora se existir
            if (!reader.IsDBNull(reader.GetOrdinal("transportadora_id")) &&
                reader.HasColumn("razao_social") && 
                !reader.IsDBNull(reader.GetOrdinal("razao_social")))
            {
                var transportadora = new Transportadora
                {
                    Id = reader.GetInt32("transportadora_id"),
                    RazaoSocial = reader.GetString("razao_social"),
                    NomeFantasia = reader.IsDBNull(reader.GetOrdinal("nome_fantasia")) 
                        ? null 
                        : reader.GetString("nome_fantasia"),
                    CNPJ = reader.GetString("cnpj"),
                    Email = reader.HasColumn("transportadora_email") && !reader.IsDBNull(reader.GetOrdinal("transportadora_email"))
                        ? reader.GetString("transportadora_email")
                        : null,
                    Telefone = reader.HasColumn("transportadora_telefone") && !reader.IsDBNull(reader.GetOrdinal("transportadora_telefone"))
                        ? reader.GetString("transportadora_telefone")
                        : null,
                    Endereco = reader.HasColumn("transportadora_endereco") && !reader.IsDBNull(reader.GetOrdinal("transportadora_endereco"))
                        ? reader.GetString("transportadora_endereco")
                        : string.Empty
                };
                
                // Mapear a cidade da transportadora
                if (reader.HasColumn("cidade_id") && !reader.IsDBNull(reader.GetOrdinal("cidade_id")))
                {
                    var cidadeId = reader.GetInt64("cidade_id");
                    var cidadeNome = reader.HasColumn("cidade_nome") && !reader.IsDBNull(reader.GetOrdinal("cidade_nome"))
                        ? reader.GetString("cidade_nome")
                        : string.Empty;
                        
                    // Mapear o estado da cidade
                    var estadoId = reader.HasColumn("estado_id") && !reader.IsDBNull(reader.GetOrdinal("estado_id"))
                        ? reader.GetInt64("estado_id")
                        : 0;
                        
                    Estado? estado = null;
                    if (estadoId > 0)
                    {
                        estado = new Estado
                        {
                            Id = (int)estadoId,
                            Nome = reader.GetString("estado_nome"),
                            UF = reader.GetString("estado_uf")
                        };
                        
                        // Mapear o país do estado
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
                    
                    transportadora.CidadeId = cidadeId;
                    transportadora.Cidade = new Cidade
                    {
                        Id = cidadeId,
                        Nome = cidadeNome,
                        CodigoIBGE = reader.HasColumn("codigo_ibge") && !reader.IsDBNull(reader.GetOrdinal("codigo_ibge"))
                            ? reader.GetString("codigo_ibge")
                            : null,
                        EstadoId = estadoId,
                        Estado = estado
                    };
                }
                
                veiculo.Transportadora = transportadora;
            }
            
            return veiculo;
        }
    }
}