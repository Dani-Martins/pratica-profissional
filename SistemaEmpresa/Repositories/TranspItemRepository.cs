using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;

namespace SistemaEmpresa.Repositories
{
    public class TranspItemRepository
    {
        private readonly MySqlConnection _connection;

        public TranspItemRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<TranspItem>> ReadAll()
        {
            var itens = new List<TranspItem>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT ti.*, t.razao_social as transportadora_nome 
                    FROM transp_item ti
                    LEFT JOIN transportadora t ON ti.transportadora_id = t.id 
                    WHERE ti.ativo = 1", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    itens.Add(new TranspItem
                    {
                        Id = reader.GetInt64("id"),
                        Codigo = reader.GetString("codigo"),
                        Descricao = reader.IsDBNull("descricao") ? null : reader.GetString("descricao"),
                        TransportadoraId = reader.IsDBNull("transportadora_id") ? null : (int)reader.GetInt64("transportadora_id"),
                        CodigoTransp = reader.IsDBNull("codigo_transp") ? null : reader.GetString("codigo_transp"),
                        Ativo = reader.GetBoolean("ativo"),
                        Transportadora = !reader.IsDBNull("transportadora_id") ? new Transportadora 
                        { 
                            Id = (int)reader.GetInt64("transportadora_id"),
                            RazaoSocial = reader.GetString("transportadora_nome")
                        } : null
                    });
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return itens;
        }

        public async Task<TranspItem?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT ti.*, t.razao_social as transportadora_nome 
                    FROM transp_item ti
                    LEFT JOIN transportadora t ON ti.transportadora_id = t.id 
                    WHERE ti.id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return new TranspItem
                    {
                        Id = reader.GetInt64("id"),
                        Codigo = reader.GetString("codigo"),
                        Descricao = reader.IsDBNull("descricao") ? null : reader.GetString("descricao"),
                        TransportadoraId = reader.IsDBNull("transportadora_id") ? null : (int)reader.GetInt64("transportadora_id"),
                        CodigoTransp = reader.IsDBNull("codigo_transp") ? null : reader.GetString("codigo_transp"),
                        Ativo = reader.GetBoolean("ativo"),
                        Transportadora = !reader.IsDBNull("transportadora_id") ? new Transportadora 
                        { 
                            Id = (int)reader.GetInt64("transportadora_id"),
                            RazaoSocial = reader.GetString("transportadora_nome")
                        } : null
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

        public async Task<bool> Create(TranspItem item)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    INSERT INTO transp_item (
                        codigo, descricao, transportadora_id,
                        codigo_transp, ativo
                    ) VALUES (
                        @codigo, @descricao, @transportadoraId,
                        @codigoTransp, @ativo
                    )", _connection);
                
                PreencherParametros(command, item);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, TranspItem item)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    UPDATE transp_item 
                    SET codigo = @codigo,
                        descricao = @descricao,
                        transportadora_id = @transportadoraId,
                        codigo_transp = @codigoTransp,
                        ativo = @ativo
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, item);
                
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
                    "UPDATE transp_item SET ativo = 0 WHERE id = @id", 
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

        public async Task<List<TranspItem>> ReadByNFE(long nfeId)
        {
            var items = new List<TranspItem>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT i.*, t.razao_social as transportadora_razao_social
                    FROM transp_item i
                    LEFT JOIN transportadora t ON i.transportadora_id = t.id
                    WHERE i.nfe_id = @nfeId
                    ORDER BY i.id", _connection);
                    
                command.Parameters.AddWithValue("@nfeId", nfeId);
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    items.Add(MapearTranspItem(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return items;
        }

        private void PreencherParametros(MySqlCommand command, TranspItem item)
        {
            command.Parameters.AddWithValue("@codigo", item.Codigo);
            command.Parameters.AddWithValue("@descricao", item.Descricao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@transportadoraId", item.TransportadoraId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@codigoTransp", item.CodigoTransp ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@ativo", item.Ativo);
        }

        private TranspItem MapearTranspItem(MySqlDataReader reader)
        {
            return new TranspItem
            {
                Id = reader.GetInt64("id"),
                Codigo = reader.GetString("codigo"),
                Descricao = reader.IsDBNull("descricao") ? null : reader.GetString("descricao"),
                TransportadoraId = reader.IsDBNull("transportadora_id") ? null : (int)reader.GetInt64("transportadora_id"),
                CodigoTransp = reader.IsDBNull("codigo_transp") ? null : reader.GetString("codigo_transp"),
                Ativo = reader.GetBoolean("ativo"),
                Transportadora = !reader.IsDBNull("transportadora_id") ? new Transportadora
                {
                    Id = (int)reader.GetInt64("transportadora_id"),
                    RazaoSocial = reader.GetString("transportadora_razao_social")
                } : null
            };
        }
    }
}