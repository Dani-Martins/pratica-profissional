using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;
using Dapper;

namespace SistemaEmpresa.Repositories
{
    public class CidadeRepository
    {
        private readonly MySqlConnection _connection;

        public CidadeRepository(MySqlConnection connection)
        {
            _connection = connection;
        }        public async Task<List<Cidade>> ReadAll()
        {
            var cidades = new List<Cidade>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT c.id, c.nome, c.codigo_ibge, c.estado_id, c.situacao, c.data_criacao, c.data_atualizacao, c.user_criacao, c.user_atualizacao, 
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id,
                           p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla
                    FROM cidade c
                    INNER JOIN estado e ON c.estado_id = e.id
                    INNER JOIN pais p ON e.pais_id = p.id
                    ORDER BY c.nome", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    cidades.Add(MapearCidade(reader));
                }
                
                return cidades;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }        public async Task<Cidade?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT c.id, c.nome, c.codigo_ibge, c.estado_id, c.situacao, c.data_criacao, c.data_atualizacao, c.user_criacao, c.user_atualizacao, 
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id,
                           p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla
                    FROM cidade c
                    INNER JOIN estado e ON c.estado_id = e.id
                    INNER JOIN pais p ON e.pais_id = p.id
                    WHERE c.id = @id", _connection);
                    
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearCidade(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }        public async Task<List<Cidade>> ReadByEstadoId(long estadoId)
        {
            var cidades = new List<Cidade>();

            try
            {
                await _connection.OpenAsync();

                using var command = new MySqlCommand(@"
                    SELECT c.id, c.nome, c.codigo_ibge, c.estado_id, c.situacao, c.data_criacao, c.data_atualizacao, c.user_criacao, c.user_atualizacao, 
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id,
                           p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla
                    FROM cidade c
                    INNER JOIN estado e ON c.estado_id = e.id
                    INNER JOIN pais p ON e.pais_id = p.id
                    WHERE c.estado_id = @estadoId
                    ORDER BY c.nome", _connection);

                command.Parameters.AddWithValue("@estadoId", estadoId);

                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    cidades.Add(MapearCidade(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }

            return cidades;
        }

        public async Task<long> Create(Cidade cidade)
        {
            try
            {
                // Log do SQL gerado (se possível)
                Console.WriteLine("Tentando criar cidade com os seguintes dados:");
                Console.WriteLine($"Nome: {cidade.Nome}");
                Console.WriteLine($"CodigoIBGE: {cidade.CodigoIBGE}");
                Console.WriteLine($"EstadoId: {cidade.EstadoId}");
                
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    INSERT INTO cidade (nome, codigo_ibge, estado_id)
                    VALUES (@nome, @codigoIBGE, @estadoId);
                    SELECT LAST_INSERT_ID();", _connection);
                
                PreencherParametros(command, cidade);
                
                var id = Convert.ToInt64(await command.ExecuteScalarAsync());
                cidade.Id = id;
                
                return id;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception em CidadeRepository.Create: {ex.Message}");
                throw;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task CreateAlternative(Cidade cidade)
        {
            try
            {
                // Primeiro, verificamos explicitamente se o estado existe
                await _connection.OpenAsync();
                using var checkCmd = new MySqlCommand("SELECT * FROM estado WHERE id = @id", _connection);
                checkCmd.Parameters.AddWithValue("@id", cidade.EstadoId);
                
                using var reader = await checkCmd.ExecuteReaderAsync();
                var estadoExiste = await reader.ReadAsync();
                
                if (!estadoExiste)
                {
                    throw new Exception($"Estado com ID {cidade.EstadoId} não existe. Verifique o ID.");
                }
                
                // Fechamos o reader antes de executar outra consulta
                await reader.CloseAsync();
                
                // Agora tentamos a inserção usando o mesmo tipo de dado que verificamos
                string sql = @"INSERT INTO cidade (nome, codigo_ibge, estado_id) 
                              VALUES (@Nome, @CodigoIBGE, @EstadoId);
                              SELECT LAST_INSERT_ID();";
                              
                using var command = new MySqlCommand(sql, _connection);
                command.Parameters.AddWithValue("@Nome", cidade.Nome);
                command.Parameters.AddWithValue("@CodigoIBGE", cidade.CodigoIBGE ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@EstadoId", cidade.EstadoId); // Remover a conversão para int
                
                var id = Convert.ToInt64(await command.ExecuteScalarAsync());
                cidade.Id = id;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception em CidadeRepository.CreateAlternative: {ex.Message}");
                throw;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, Cidade cidade)
        {
            try
            {
                await _connection.OpenAsync();

                // Verifica se o estado existe
                using var checkCommand = new MySqlCommand(
                    "SELECT COUNT(*) FROM estado WHERE id = @estadoId", 
                    _connection);
                
                checkCommand.Parameters.AddWithValue("@estadoId", cidade.EstadoId);
                var estadoExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;

                if (!estadoExists)
                    throw new InvalidOperationException($"Estado com ID {cidade.EstadoId} não encontrado");

                using var command = new MySqlCommand(@"
                    UPDATE cidade
                    SET nome = @nome,
                        codigo_ibge = @codigoIBGE,
                        estado_id = @estadoId
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, cidade);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }        public async Task<bool> Delete(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                // Em vez de excluir fisicamente, inativa o registro (situacao = 0)
                using var command = new MySqlCommand(@"
                    UPDATE cidade 
                    SET situacao = 0, 
                        data_atualizacao = NOW(), 
                        user_atualizacao = 'SISTEMA_WEB'
                    WHERE id = @id", 
                    _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }public async Task<IEnumerable<Cidade>> GetAllAsync()
        {
            var cidades = new List<Cidade>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT c.id, c.nome, c.codigo_ibge, c.estado_id, c.situacao, c.data_criacao, c.data_atualizacao, c.user_criacao, c.user_atualizacao, 
                           e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id,
                           p.nome as pais_nome, p.codigo as pais_codigo, p.sigla as pais_sigla
                    FROM cidade c
                    INNER JOIN estado e ON c.estado_id = e.id
                    INNER JOIN pais p ON e.pais_id = p.id
                    ORDER BY c.nome", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    cidades.Add(MapearCidade(reader));
                }
                
                return cidades;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task InsercaoDireta(string nome, string codigoIbge, long estadoId)
        {
            try
            {
                await _connection.OpenAsync();
                
                string sql = "INSERT INTO cidade (nome, codigo_ibge, estado_id) VALUES (@nome, @codigo, @estadoId)";
                
                using var command = new MySqlCommand(sql, _connection);
                // Definir tipos explicitamente
                command.Parameters.Add("@nome", MySqlDbType.VarChar).Value = nome;
                command.Parameters.Add("@codigo", MySqlDbType.VarChar).Value = codigoIbge ?? (object)DBNull.Value;
                command.Parameters.Add("@estadoId", MySqlDbType.Int64).Value = estadoId;
                
                await command.ExecuteNonQueryAsync();
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> TemDependencias(long cidadeId)
        {
            try
            {
                await _connection.OpenAsync();
                Console.WriteLine($"Conexão aberta para verificar dependências da cidade {cidadeId}");
                
                // Lista de tabelas a verificar
                var tabelas = new List<string> {
                    "cliente", "fornecedor", "funcionario", "endereco",
                    // Adicione outras tabelas conforme necessário
                    "transportadora", "filial", "usuario"
                };
                
                // Verificar cada tabela individualmente e logar resultados
                foreach (var tabela in tabelas)
                {
                    string sql = $"SELECT COUNT(*) FROM {tabela} WHERE cidade_id = @cidadeId LIMIT 1";
                    try {
                        using var command = new MySqlCommand(sql, _connection);
                        command.Parameters.AddWithValue("@cidadeId", cidadeId);
                        var count = Convert.ToInt32(await command.ExecuteScalarAsync());
                        
                        if (count > 0) {
                            Console.WriteLine($"Encontradas {count} referências na tabela {tabela}");
                            return true;
                        }
                    }
                    catch (Exception ex) {
                        // Se uma tabela não existir, apenas continue para a próxima
                        Console.WriteLine($"Erro ao verificar tabela {tabela}: {ex.Message}");
                    }
                }
                
                Console.WriteLine("Nenhuma dependência encontrada");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERRO GERAL ao verificar dependências: {ex.Message}");
                throw;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<IEnumerable<Cidade>> ReadByEstadoIdDapper(long estadoId)
        {
            try
            {
                Console.WriteLine($"Repository: Buscando cidades para o estado ID: {estadoId}");
                
                await _connection.OpenAsync();
                
                string sql = @"
                    SELECT c.id, c.nome, c.codigo_ibge as CodigoIBGE, c.estado_id as EstadoId,
                           e.nome as EstadoNome, e.sigla as EstadoSigla, e.pais_id as EstadoPaisId
                    FROM cidade c
                    INNER JOIN estado e ON c.estado_id = e.id
                    WHERE c.estado_id = @EstadoId
                    ORDER BY c.nome";
                
                var cidades = await _connection.QueryAsync<Cidade, Estado, Cidade>(
                    sql,
                    (cidade, estado) => 
                    {
                        cidade.Estado = estado;
                        return cidade;
                    },
                    new { EstadoId = estadoId },
                    splitOn: "EstadoNome"
                );
                
                var cidadesList = cidades.ToList();
                Console.WriteLine($"Repository: Encontradas {cidadesList.Count} cidades");
                
                return cidadesList;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERRO no repository ao buscar cidades por estado: {ex.Message}");
                throw;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        private void PreencherParametros(MySqlCommand command, Cidade cidade)
        {
            command.Parameters.AddWithValue("@nome", cidade.Nome);
            command.Parameters.AddWithValue("@codigoIBGE", 
                cidade.CodigoIBGE ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@estadoId", cidade.EstadoId);
        }        private Cidade MapearCidade(MySqlDataReader reader)
        {
            // Verificar e registrar todos os campos presentes no reader para diagnóstico
            var availableColumns = new List<string>();
            for (int i = 0; i < reader.FieldCount; i++)
            {
                availableColumns.Add(reader.GetName(i));
            }
            Console.WriteLine($"Campos disponíveis no reader: {string.Join(", ", availableColumns)}");
            
            string? codigoIbge = null;
            if (!reader.IsDBNull(reader.GetOrdinal("codigo_ibge")))
            {
                codigoIbge = reader.GetString("codigo_ibge");
                Console.WriteLine($"CodigoIBGE encontrado: {codigoIbge}");
            }
            else
            {
                Console.WriteLine("Campo codigo_ibge é nulo ou não encontrado");
            }
              var cidade = new Cidade
            {
                Id = reader.GetInt64("id"),
                Nome = reader.GetString("nome"),
                CodigoIBGE = codigoIbge,
                EstadoId = reader.GetInt64("estado_id"),
                Estado = new Estado
                {
                    Id = (int)reader.GetInt64("estado_id"),
                    Nome = reader.GetString("estado_nome"),
                    UF = reader.GetString("estado_uf"),
                    PaisId = reader.GetInt32("estado_pais_id"),
                    Pais = new Pais
                    {
                        Id = reader.GetInt32("estado_pais_id"),
                        Nome = reader.GetString("pais_nome"),
                        Codigo = reader.IsDBNull(reader.GetOrdinal("pais_codigo")) 
                            ? string.Empty 
                            : reader.GetString("pais_codigo"),
                        Sigla = reader.IsDBNull(reader.GetOrdinal("pais_sigla")) 
                            ? string.Empty 
                            : reader.GetString("pais_sigla")
                    }
                },
                Situacao = reader.GetBoolean("situacao"),
                DataCriacao = reader.IsDBNull(reader.GetOrdinal("data_criacao")) 
                    ? DateTime.Now 
                    : reader.GetDateTime("data_criacao"),
                DataAtualizacao = reader.IsDBNull(reader.GetOrdinal("data_atualizacao")) 
                    ? null 
                    : reader.GetDateTime("data_atualizacao")
            };
            
            // Log para verificar os valores mapeados
            Console.WriteLine($"Cidade mapeada: ID={cidade.Id}, Nome={cidade.Nome}, CodigoIBGE={cidade.CodigoIBGE}, EstadoId={cidade.EstadoId}, Situacao={cidade.Situacao}");
            
            return cidade;
        }
    }
}
