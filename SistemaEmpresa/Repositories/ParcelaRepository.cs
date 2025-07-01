using MySqlConnector;
using SistemaEmpresa.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace SistemaEmpresa.Repositories
{
    public class ParcelaRepository
    {
        private readonly MySqlConnection _connection;

        public ParcelaRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<Parcela>> ReadAll()
        {
            var parcelas = new List<Parcela>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT p.*, c.descricao as condicao_pagamento_nome 
                    FROM parcela p
                    LEFT JOIN condicao_pagamento c ON p.condicao_pagamento_id = c.id 
                    ORDER BY p.numero", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    parcelas.Add(MapearParcela(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return parcelas;
        }

        public async Task<List<Parcela>> ReadByCondicaoPagamento(long condicaoPagamentoId)
        {
            var parcelas = new List<Parcela>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT p.*, c.descricao as condicao_pagamento_nome 
                    FROM parcela p
                    LEFT JOIN condicao_pagamento c ON p.condicao_pagamento_id = c.id 
                    WHERE p.condicao_pagamento_id = @condicaoPagamentoId
                    ORDER BY p.numero", _connection);
                
                command.Parameters.AddWithValue("@condicaoPagamentoId", condicaoPagamentoId);
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    parcelas.Add(MapearParcela(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return parcelas;
        }

        public async Task<Parcela?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT p.*, c.descricao as condicao_pagamento_nome 
                    FROM parcela p
                    LEFT JOIN condicao_pagamento c ON p.condicao_pagamento_id = c.id 
                    WHERE p.id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearParcela(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Create(Parcela parcela)
        {
            try
            {
                await _connection.OpenAsync();

                // Verifica se a condição de pagamento existe
                using var checkCommand = new MySqlCommand(
                    "SELECT COUNT(*) FROM condicao_pagamento WHERE id = @condicaoPagamentoId AND ativo = 1", 
                    _connection);
                
                checkCommand.Parameters.AddWithValue("@condicaoPagamentoId", parcela.CondicaoPagamentoId);
                var condicaoExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;

                if (!condicaoExists)
                    throw new InvalidOperationException($"Condição de pagamento com ID {parcela.CondicaoPagamentoId} não encontrada ou inativa");

                using var command = new MySqlCommand(@"
                    INSERT INTO parcela (
                        condicao_pagamento_id, numero, dias,
                        percentual
                    ) VALUES (
                        @condicaoPagamentoId, @numero, @dias,
                        @percentual
                    )", _connection);
                
                PreencherParametros(command, parcela);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, Parcela parcela)
        {
            try
            {
                await _connection.OpenAsync();

                // Verifica se a condição de pagamento existe
                using var checkCommand = new MySqlCommand(
                    "SELECT COUNT(*) FROM condicao_pagamento WHERE id = @condicaoPagamentoId AND ativo = 1", 
                    _connection);
                
                checkCommand.Parameters.AddWithValue("@condicaoPagamentoId", parcela.CondicaoPagamentoId);
                var condicaoExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;

                if (!condicaoExists)
                    throw new InvalidOperationException($"Condição de pagamento com ID {parcela.CondicaoPagamentoId} não encontrada ou inativa");

                using var command = new MySqlCommand(@"
                    UPDATE parcela 
                    SET condicao_pagamento_id = @condicaoPagamentoId,
                        numero = @numero,
                        dias = @dias,
                        percentual = @percentual
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, parcela);
                
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
                    "DELETE FROM parcela WHERE id = @id", 
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

        public async Task<IEnumerable<Parcela>> ReadByFaturaId(long faturaId)
        {
            var parcelas = new List<Parcela>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT p.*, c.descricao as condicao_pagamento_nome 
                    FROM parcela p
                    LEFT JOIN condicao_pagamento c ON p.condicao_pagamento_id = c.id 
                    WHERE p.fatura_id = @faturaId", _connection);
                
                command.Parameters.AddWithValue("@faturaId", faturaId);
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    parcelas.Add(MapearParcela(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return parcelas;
        }

        private void PreencherParametros(MySqlCommand command, Parcela parcela)
        {
            command.Parameters.AddWithValue("@condicaoPagamentoId", parcela.CondicaoPagamentoId);
            command.Parameters.AddWithValue("@numero", parcela.Numero);
            command.Parameters.AddWithValue("@dias", parcela.Dias);
            command.Parameters.AddWithValue("@percentual", parcela.Percentual);
        }

        private Parcela MapearParcela(MySqlDataReader reader)
        {
            return new Parcela
            {
                Id = reader.GetInt64("id"),
                CondicaoPagamentoId = reader.GetInt64("condicao_pagamento_id"),
                Numero = reader.GetInt32("numero"),
                Dias = reader.GetInt32("dias"),
                Percentual = reader.GetDecimal("percentual"),
                CondicaoPagamento = !reader.IsDBNull(reader.GetOrdinal("condicao_pagamento_nome")) 
                    ? new CondicaoPagamento 
                    { 
                        Id = reader.GetInt64("condicao_pagamento_id"),
                        Descricao = reader.GetString("condicao_pagamento_nome")
                    } 
                    : null
            };
        }
    }
}
