using MySqlConnector;
using SistemaEmpresa.Models;

namespace SistemaEmpresa.Repositories
{
    public class MovimentacaoNFERepository
    {
        private readonly MySqlConnection _connection;

        public MovimentacaoNFERepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<MovimentacaoNFE>> ReadAll()
        {
            var movimentacoes = new List<MovimentacaoNFE>();
            var sql = @"SELECT m.*, n.numero as nfe_numero, n.serie as nfe_serie
                       FROM movimentacao_nfe m
                       INNER JOIN nfe n ON n.id = m.nfe_id
                       ORDER BY m.data_movimentacao DESC";

            await _connection.OpenAsync();
            using var command = new MySqlCommand(sql, _connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                movimentacoes.Add(MapearMovimentacao(reader));
            }

            return movimentacoes;
        }

        public async Task<MovimentacaoNFE?> ReadById(long id)
        {
            var sql = @"SELECT m.*, n.numero as nfe_numero, n.serie as nfe_serie
                       FROM movimentacao_nfe m
                       INNER JOIN nfe n ON n.id = m.nfe_id
                       WHERE m.id = @id";

            await _connection.OpenAsync();
            using var command = new MySqlCommand(sql, _connection);
            command.Parameters.AddWithValue("@id", id);
            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return MapearMovimentacao(reader);
            }

            return null;
        }

        public async Task<IEnumerable<MovimentacaoNFE>> ReadByNFE(long nfeId)
        {
            var movimentacoes = new List<MovimentacaoNFE>();
            var sql = @"SELECT m.*, n.numero as nfe_numero, n.serie as nfe_serie
                       FROM movimentacao_nfe m
                       INNER JOIN nfe n ON n.id = m.nfe_id
                       WHERE m.nfe_id = @nfe_id
                       ORDER BY m.data_movimentacao DESC";

            await _connection.OpenAsync();
            using var command = new MySqlCommand(sql, _connection);
            command.Parameters.AddWithValue("@nfe_id", nfeId);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                movimentacoes.Add(MapearMovimentacao(reader));
            }

            return movimentacoes;
        }

        public async Task<long> Create(MovimentacaoNFE movimentacao)
        {
            var sql = @"INSERT INTO movimentacao_nfe 
                       (nfe_id, data_movimentacao, status, descricao)
                       VALUES 
                       (@nfe_id, @data_movimentacao, @status, @descricao);
                       SELECT LAST_INSERT_ID();";

            await _connection.OpenAsync();
            using var command = new MySqlCommand(sql, _connection);
            PreencherParametros(command, movimentacao);
            var id = await command.ExecuteScalarAsync();
            return Convert.ToInt64(id);
        }

        public async Task<bool> Update(MovimentacaoNFE movimentacao)
        {
            var sql = @"UPDATE movimentacao_nfe 
                       SET nfe_id = @nfe_id,
                           data_movimentacao = @data_movimentacao,
                           status = @status,
                           descricao = @descricao
                       WHERE id = @id";

            await _connection.OpenAsync();
            using var command = new MySqlCommand(sql, _connection);
            command.Parameters.AddWithValue("@id", movimentacao.Id);
            PreencherParametros(command, movimentacao);
            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> Delete(long id)
        {
            var sql = @"DELETE FROM movimentacao_nfe WHERE id = @id";

            await _connection.OpenAsync();
            using var command = new MySqlCommand(sql, _connection);
            command.Parameters.AddWithValue("@id", id);
            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<IEnumerable<MovimentacaoNFE>> ReadByNfeId(long nfeId)
        {
            return await ReadByNFE(nfeId);
        }

        private void PreencherParametros(MySqlCommand command, MovimentacaoNFE movimentacao)
        {
            command.Parameters.AddWithValue("@nfe_id", movimentacao.NfeId);
            command.Parameters.AddWithValue("@data_movimentacao", movimentacao.DataMovimentacao);
            command.Parameters.AddWithValue("@status", movimentacao.Status);
            command.Parameters.AddWithValue("@descricao", 
                movimentacao.Descricao ?? (object)DBNull.Value);
        }

        private MovimentacaoNFE MapearMovimentacao(MySqlDataReader reader)
        {
            return new MovimentacaoNFE
            {
                Id = reader.GetInt64("id"),
                NfeId = reader.GetInt64("nfe_id"),
                DataMovimentacao = reader.GetDateTime("data_movimentacao"),
                Status = reader.GetString("status"),
                Descricao = reader.IsDBNull(reader.GetOrdinal("descricao")) ? 
                    null : reader.GetString("descricao"),
                NFE = new NFE 
                { 
                    Id = reader.GetInt64("nfe_id"),
                    Numero = reader.GetInt32("nfe_numero").ToString(),
                    Serie = reader.GetString("nfe_serie")
                }
            };
        }
    }
}