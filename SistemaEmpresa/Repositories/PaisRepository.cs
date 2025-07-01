using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;

namespace SistemaEmpresa.Repositories
{    public class PaisRepository
    {
        private readonly string _connectionString;

        public PaisRepository(MySqlConnection connection)
        {
            // Extrair a string de conexão para uso posterior
            _connectionString = connection.ConnectionString;
        }        public async Task<List<Pais>> ReadAll()
        {
            var paises = new List<Pais>();
            
            using var connection = new MySqlConnection(_connectionString);
            try
            {
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    "SELECT * FROM pais ORDER BY nome", connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    var pais = MapearPais(reader);
                    
                    // Log para debug
                    Console.WriteLine($"Lendo país do banco: ID={pais.Id}, Nome={pais.Nome}, Situacao={pais.Situacao}, DataCriacao={pais.DataCriacao}");
                    
                    paises.Add(pais);
                }
                
                return paises;
            }
            finally
            {
                if (connection.State == ConnectionState.Open)
                    await connection.CloseAsync();
            }
        }        public async Task<Pais?> ReadById(int id)  // Mudança de string para int
        {
            using var connection = new MySqlConnection(_connectionString);
            try
            {
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    "SELECT * FROM pais WHERE id = @id", connection);
                      command.Parameters.AddWithValue("@id", id);  // ID como int
                
                Console.WriteLine($"Buscando país pelo ID: {id}");
                
                using var reader = await command.ExecuteReaderAsync();
                  if (await reader.ReadAsync())
                {
                    var pais = MapearPais(reader);
                    Console.WriteLine($"País encontrado: ID={pais.Id}, Nome={pais.Nome}, Situacao={pais.Situacao}");
                    return pais;
                }
                
                Console.WriteLine($"País com ID {id} não encontrado");
                return null;
            }
            finally
            {
                if (connection.State == ConnectionState.Open)
                    await connection.CloseAsync();
            }
        }        public async Task<bool> Create(Pais pais)
        {
            using var connection = new MySqlConnection(_connectionString);
            try
            {
                await connection.OpenAsync();                
                // Garantir valores padrão adequados
                using var command = new MySqlCommand(@"
                    INSERT INTO pais (id, nome, codigo, sigla, situacao, datacriacao, dataalteracao, usercriacao, useralteracao)
                    VALUES (@id, @nome, @codigo, @sigla, IFNULL(@situacao, 1), IFNULL(@datacriacao, NOW()), @dataalteracao, IFNULL(@usercriacao, 'SISTEMA'), @useralteracao)", connection);
                
                PreencherParametros(command, pais);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (connection.State == ConnectionState.Open)
                    await connection.CloseAsync();
            }
        }public async Task Update(int id, Pais pais)
        {
            using var connection = new MySqlConnection(_connectionString);
            try
            {
                await connection.OpenAsync();                // Não precisamos mais obter os dados atuais aqui
                  string sql = @"UPDATE pais 
                              SET Nome = @Nome, 
                                  Sigla = @Sigla, 
                                  Codigo = @Codigo,
                                  situacao = @Situacao,
                                  dataalteracao = IFNULL(@DataAlteracao, NOW()),
                                  useralteracao = IFNULL(@UserAlteracao, 'SISTEMA')
                              WHERE id = @idParam";
                              
                using var cmd = new MySqlCommand(sql, connection);                // Log para verificar os valores recebidos
                Console.WriteLine($"Atualizando país ID {id}: Nome={pais.Nome}, Situacao={pais.Situacao}");
                
                // Adicionar parâmetros com nomes diferentes
                cmd.Parameters.AddWithValue("@Nome", pais.Nome);
                cmd.Parameters.AddWithValue("@Sigla", pais.Sigla);
                cmd.Parameters.AddWithValue("@Codigo", pais.Codigo);
                cmd.Parameters.AddWithValue("@Situacao", pais.Situacao); // Garantir que o valor de situação seja preservado
                cmd.Parameters.AddWithValue("@DataAlteracao", pais.DataAlteracao ?? DateTime.Now);
                cmd.Parameters.AddWithValue("@UserAlteracao", pais.UserAlteracao ?? "SISTEMA");                cmd.Parameters.AddWithValue("@idParam", id); // Usar nome diferente
                
                // Adicionar log para valores dos parâmetros
                Console.WriteLine($"Parâmetros SQL: Nome={cmd.Parameters["@Nome"].Value}, " +
                                 $"Sigla={cmd.Parameters["@Sigla"].Value}, " +
                                 $"Codigo={cmd.Parameters["@Codigo"].Value}, " +
                                 $"Situacao={cmd.Parameters["@Situacao"].Value}, " +
                                 $"ID={cmd.Parameters["@idParam"].Value}");
                  await cmd.ExecuteNonQueryAsync();
            }
            finally
            {
                if (connection.State == ConnectionState.Open)
                    await connection.CloseAsync();
            }
        }        public async Task<bool> Delete(int id)  // Mudança de string para int
        {
            using var connection = new MySqlConnection(_connectionString);
            try
            {
                await connection.OpenAsync();
                
                // Em vez de DELETE, faremos UPDATE da situação para 0 (inativo)
                using var command = new MySqlCommand(
                    "UPDATE pais SET situacao = 0, dataalteracao = NOW(), useralteracao = 'SISTEMA' WHERE id = @id", 
                    connection);
                
                command.Parameters.AddWithValue("@id", id);  // ID como int
                
                int rowsAffected = await command.ExecuteNonQueryAsync();
                Console.WriteLine($"PaisRepository.Delete: Atualizando situação do país ID {id} para inativo. Linhas afetadas: {rowsAffected}");
                
                return rowsAffected > 0;
            }
            finally
            {
                if (connection.State == ConnectionState.Open)
                    await connection.CloseAsync();
            }
        }        public async Task<IEnumerable<Pais>> GetAllAsync()
        {
            var paises = new List<Pais>();
            
            using var connection = new MySqlConnection(_connectionString);
            try
            {
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT * FROM pais
                    ORDER BY nome", connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    paises.Add(MapearPais(reader));
                }
                
                return paises;
            }
            finally
            {
                if (connection.State == ConnectionState.Open)
                    await connection.CloseAsync();
            }
        }private void PreencherParametros(MySqlCommand command, Pais pais)
        {
            command.Parameters.AddWithValue("@id", pais.Id);
            command.Parameters.AddWithValue("@nome", pais.Nome);
            command.Parameters.AddWithValue("@codigo", pais.Codigo ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@sigla", pais.Sigla ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@situacao", pais.Situacao);
            command.Parameters.AddWithValue("@datacriacao", pais.DataCriacao);
            command.Parameters.AddWithValue("@dataalteracao", pais.DataAlteracao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@usercriacao", pais.UserCriacao);
            command.Parameters.AddWithValue("@useralteracao", pais.UserAlteracao ?? (object)DBNull.Value);
        }        private Pais MapearPais(MySqlDataReader reader)
        {
            // Verificar se situacao existe e qual é o valor
            var temSituacao = !reader.IsDBNull(reader.GetOrdinal("situacao"));
            int situacao = 1; // Default é ativo
            
            if (temSituacao)
            {                situacao = reader.GetInt32("situacao");
                Console.WriteLine($"Situação do país no banco: {situacao}");
            } else {
                Console.WriteLine("Campo situacao não encontrado ou nulo no banco. Usando valor padrão 1 (ativo).");
            }
            
            return new Pais
            {
                Id = reader.GetInt32("id"),  // Usando GetInt32
                Nome = reader.GetString("nome"),
                Sigla = reader.IsDBNull(reader.GetOrdinal("sigla")) 
                    ? string.Empty 
                    : reader.GetString("sigla"),
                Codigo = reader.IsDBNull(reader.GetOrdinal("codigo")) 
                    ? string.Empty 
                    : reader.GetString("codigo"),
                // Garantir que situação seja 1 (ativo) por padrão
                Situacao = temSituacao ? situacao : 1,                // Garantir que DataCriacao nunca seja nulo
                DataCriacao = reader.IsDBNull(reader.GetOrdinal("datacriacao"))
                    ? DateTime.Now  // Se for nulo, usar a data atual
                    : reader.GetDateTime("datacriacao"),
                DataAlteracao = reader.IsDBNull(reader.GetOrdinal("dataalteracao"))
                    ? null
                    : reader.GetDateTime("dataalteracao"),
                UserCriacao = reader.IsDBNull(reader.GetOrdinal("usercriacao"))
                    ? "SISTEMA"
                    : reader.GetString("usercriacao"),
                UserAlteracao = reader.IsDBNull(reader.GetOrdinal("useralteracao"))
                    ? null
                    : reader.GetString("useralteracao")
            };
        }
    }
}
