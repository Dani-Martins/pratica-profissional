using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;

namespace SistemaEmpresa.Repositories
{
    public class FaturaRepository
    {
        private readonly MySqlConnection _connection;

        public FaturaRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<Fatura>> ReadAll()
        {
            var faturas = new List<Fatura>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT f.*, n.numero as nfe_numero,
                           fp.nome as forma_pagamento_nome
                    FROM fatura f
                    LEFT JOIN nfe n ON f.nfe_id = n.id
                    LEFT JOIN forma_pagamento fp ON f.forma_pagamento_id = fp.id 
                    ORDER BY f.numero", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    faturas.Add(MapearFatura(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return faturas;
        }

        public async Task<List<Fatura>> ReadByNFE(long nfeId)
        {
            var faturas = new List<Fatura>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT f.*, n.numero as nfe_numero,
                           fp.nome as forma_pagamento_nome
                    FROM fatura f
                    LEFT JOIN nfe n ON f.nfe_id = n.id
                    LEFT JOIN forma_pagamento fp ON f.forma_pagamento_id = fp.id 
                    WHERE f.nfe_id = @nfeId
                    ORDER BY f.numero", _connection);
                
                command.Parameters.AddWithValue("@nfeId", nfeId);
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    faturas.Add(MapearFatura(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return faturas;
        }

        public async Task<Fatura?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT f.*, n.numero as nfe_numero,
                           fp.nome as forma_pagamento_nome
                    FROM fatura f
                    LEFT JOIN nfe n ON f.nfe_id = n.id
                    LEFT JOIN forma_pagamento fp ON f.forma_pagamento_id = fp.id 
                    WHERE f.id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearFatura(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Create(Fatura fatura)
        {
            try
            {
                await _connection.OpenAsync();

                // Verifica se a NFE existe
                using (var checkNfeCommand = new MySqlCommand(
                    "SELECT COUNT(*) FROM nfe WHERE id = @nfeId", 
                    _connection))
                {
                    checkNfeCommand.Parameters.AddWithValue("@nfeId", fatura.NfeId);
                    if (Convert.ToInt32(await checkNfeCommand.ExecuteScalarAsync()) == 0)
                        throw new InvalidOperationException($"NFE com ID {fatura.NfeId} não encontrada");
                }

                // Verifica se a forma de pagamento existe e está ativa
                if (fatura.FormaPagamentoId.HasValue)
                {
                    using var checkFormaPagamentoCommand = new MySqlCommand(
                        "SELECT COUNT(*) FROM forma_pagamento WHERE id = @formaPagamentoId AND ativo = 1", 
                        _connection);
                    
                    checkFormaPagamentoCommand.Parameters.AddWithValue("@formaPagamentoId", fatura.FormaPagamentoId.Value);
                    if (Convert.ToInt32(await checkFormaPagamentoCommand.ExecuteScalarAsync()) == 0)
                        throw new InvalidOperationException($"Forma de pagamento com ID {fatura.FormaPagamentoId} não encontrada ou inativa");
                }

                using var command = new MySqlCommand(@"
                    INSERT INTO fatura (
                        nfe_id, numero, valor,
                        data_vencimento, forma_pagamento_id
                    ) VALUES (
                        @nfeId, @numero, @valor,
                        @dataVencimento, @formaPagamentoId
                    )", _connection);
                
                PreencherParametros(command, fatura);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, Fatura fatura)
        {
            try
            {
                await _connection.OpenAsync();

                // Verifica se a NFE existe
                using (var checkNfeCommand = new MySqlCommand(
                    "SELECT COUNT(*) FROM nfe WHERE id = @nfeId", 
                    _connection))
                {
                    checkNfeCommand.Parameters.AddWithValue("@nfeId", fatura.NfeId);
                    if (Convert.ToInt32(await checkNfeCommand.ExecuteScalarAsync()) == 0)
                        throw new InvalidOperationException($"NFE com ID {fatura.NfeId} não encontrada");
                }

                // Verifica se a forma de pagamento existe e está ativa
                if (fatura.FormaPagamentoId.HasValue)
                {
                    using var checkFormaPagamentoCommand = new MySqlCommand(
                        "SELECT COUNT(*) FROM forma_pagamento WHERE id = @formaPagamentoId AND ativo = 1", 
                        _connection);
                    
                    checkFormaPagamentoCommand.Parameters.AddWithValue("@formaPagamentoId", fatura.FormaPagamentoId.Value);
                    if (Convert.ToInt32(await checkFormaPagamentoCommand.ExecuteScalarAsync()) == 0)
                        throw new InvalidOperationException($"Forma de pagamento com ID {fatura.FormaPagamentoId} não encontrada ou inativa");
                }

                using var command = new MySqlCommand(@"
                    UPDATE fatura 
                    SET nfe_id = @nfeId,
                        numero = @numero,
                        valor = @valor,
                        data_vencimento = @dataVencimento,
                        forma_pagamento_id = @formaPagamentoId
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, fatura);
                
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
                    "DELETE FROM fatura WHERE id = @id", 
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

        public async Task<IEnumerable<Fatura>> ReadByNfeId(long nfeId)
        {
            return await ReadByNFE(nfeId);
        }

        private void PreencherParametros(MySqlCommand command, Fatura fatura)
        {
            command.Parameters.AddWithValue("@nfeId", fatura.NfeId);
            command.Parameters.AddWithValue("@numero", fatura.Numero);
            command.Parameters.AddWithValue("@valor", fatura.Valor);
            command.Parameters.AddWithValue("@dataVencimento", fatura.DataVencimento);
            command.Parameters.AddWithValue("@formaPagamentoId", 
                fatura.FormaPagamentoId.HasValue ? fatura.FormaPagamentoId.Value : DBNull.Value);
        }

        private Fatura MapearFatura(MySqlDataReader reader)
        {
            return new Fatura
            {
                Id = reader.GetInt64("id"),
                NfeId = reader.GetInt64("nfe_id"),
                Numero = reader.GetInt32("numero"),
                Valor = reader.GetDecimal("valor"),
                DataVencimento = reader.GetDateTime("data_vencimento"),
                FormaPagamentoId = reader.IsDBNull("forma_pagamento_id") ? null : reader.GetInt64("forma_pagamento_id"),
                NFE = new NFE { Id = reader.GetInt64("nfe_id"), Numero = reader.GetString("nfe_numero") },
                FormaPagamento = !reader.IsDBNull(reader.GetOrdinal("forma_pagamento_nome")) 
                    ? new FormaPagamento 
                    { 
                        Id = reader.GetInt64("forma_pagamento_id"),
                    } 
                    : null
            };
        }
    }
}
