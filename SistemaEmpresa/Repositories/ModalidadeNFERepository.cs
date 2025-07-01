using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;

namespace SistemaEmpresa.Repositories
{
    public class ModalidadeNFERepository
    {
        private readonly MySqlConnection _connection;

        public ModalidadeNFERepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<ModalidadeNFE>> ReadAll()
        {
            var modalidades = new List<ModalidadeNFE>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT * FROM modalidade_nfe 
                    WHERE ativo = 1", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    modalidades.Add(new ModalidadeNFE
                    {
                        Id = reader.GetInt64("id"),
                        Codigo = reader.GetString("codigo"),
                        Descricao = reader.GetString("descricao"),
                        Ativo = reader.GetBoolean("ativo")
                    });
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return modalidades;
        }

        public async Task<ModalidadeNFE?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT * FROM modalidade_nfe 
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return new ModalidadeNFE
                    {
                        Id = reader.GetInt64("id"),
                        Codigo = reader.GetString("codigo"),
                        Descricao = reader.GetString("descricao"),
                        Ativo = reader.GetBoolean("ativo")
                    };
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Create(ModalidadeNFE modalidade)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    INSERT INTO modalidade_nfe (
                        codigo, descricao, ativo
                    ) VALUES (
                        @codigo, @descricao, @ativo
                    )", _connection);
                
                PreencherParametros(command, modalidade);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, ModalidadeNFE modalidade)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    UPDATE modalidade_nfe 
                    SET codigo = @codigo,
                        descricao = @descricao,
                        ativo = @ativo
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, modalidade);
                
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
                    "UPDATE modalidade_nfe SET ativo = 0 WHERE id = @id", 
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

        private void PreencherParametros(MySqlCommand command, ModalidadeNFE modalidade)
        {
            command.Parameters.AddWithValue("@codigo", modalidade.Codigo);
            command.Parameters.AddWithValue("@descricao", modalidade.Descricao);
            command.Parameters.AddWithValue("@ativo", modalidade.Ativo);
        }
    }
}