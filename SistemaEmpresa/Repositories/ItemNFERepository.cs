using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;

namespace SistemaEmpresa.Repositories
{
    public class ItemNFERepository
    {
        private readonly MySqlConnection _connection;

        public ItemNFERepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<ItemNFE>> ReadAll()
        {
            var itens = new List<ItemNFE>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT i.*, p.descricao as produto_descricao,
                           n.numero as nfe_numero
                    FROM item_nfe i
                    LEFT JOIN produto p ON i.produto_id = p.id
                    LEFT JOIN nfe n ON i.nfe_id = n.id
                    ORDER BY i.id", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    itens.Add(MapearItemNFE(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return itens;
        }

        public async Task<List<ItemNFE>> ReadByNFE(long nfeId)
        {
            var itens = new List<ItemNFE>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT i.*, p.descricao as produto_descricao,
                           n.numero as nfe_numero
                    FROM item_nfe i
                    LEFT JOIN produto p ON i.produto_id = p.id
                    LEFT JOIN nfe n ON i.nfe_id = n.id
                    WHERE i.nfe_id = @nfeId
                    ORDER BY i.id", _connection);
                
                command.Parameters.AddWithValue("@nfeId", nfeId);
                
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    itens.Add(MapearItemNFE(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return itens;
        }

        public async Task<ItemNFE?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT i.*, p.descricao as produto_descricao,
                           n.numero as nfe_numero
                    FROM item_nfe i
                    LEFT JOIN produto p ON i.produto_id = p.id
                    LEFT JOIN nfe n ON i.nfe_id = n.id
                    WHERE i.id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearItemNFE(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        // Método Create modificado
        public async Task<bool> Create(ItemNFE item)
        {
            try
            {
                await _connection.OpenAsync();

                // Verifica se a NFE existe
                using (var checkNFE = new MySqlCommand(
                    "SELECT COUNT(*) FROM nfe WHERE id = @nfeId", 
                    _connection))
                {
                    checkNFE.Parameters.AddWithValue("@nfeId", item.NfeId);
                    if (Convert.ToInt32(await checkNFE.ExecuteScalarAsync()) == 0)
                        throw new InvalidOperationException($"NFE com ID {item.NfeId} não encontrada");
                }

                // Verifica se o Produto existe
                using (var checkProduto = new MySqlCommand(
                    "SELECT COUNT(*) FROM produto WHERE id = @produtoId", 
                    _connection))
                {
                    checkProduto.Parameters.AddWithValue("@produtoId", item.ProdutoId);
                    if (Convert.ToInt32(await checkProduto.ExecuteScalarAsync()) == 0)
                        throw new InvalidOperationException($"Produto com ID {item.ProdutoId} não encontrado");
                }

                using var command = new MySqlCommand(@"
                    INSERT INTO item_nfe (
                        nfe_id, produto_id, quantidade,
                        valor_unitario, valor_total
                        /* remova 'desconto' daqui */
                    ) VALUES (
                        @nfeId, @produtoId, @quantidade,
                        @valorUnitario, @valorTotal
                        /* remova '@desconto' daqui */
                    )", _connection);
                
                PreencherParametrosSemDesconto(command, item);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        // Método Update modificado
        public async Task<bool> Update(long id, ItemNFE item)
        {
            try
            {
                await _connection.OpenAsync();

                // Verifica se a NFE existe
                using (var checkNFE = new MySqlCommand(
                    "SELECT COUNT(*) FROM nfe WHERE id = @nfeId", 
                    _connection))
                {
                    checkNFE.Parameters.AddWithValue("@nfeId", item.NfeId);
                    if (Convert.ToInt32(await checkNFE.ExecuteScalarAsync()) == 0)
                        throw new InvalidOperationException($"NFE com ID {item.NfeId} não encontrada");
                }

                // Verifica se o Produto existe
                using (var checkProduto = new MySqlCommand(
                    "SELECT COUNT(*) FROM produto WHERE id = @produtoId", 
                    _connection))
                {
                    checkProduto.Parameters.AddWithValue("@produtoId", item.ProdutoId);
                    if (Convert.ToInt32(await checkProduto.ExecuteScalarAsync()) == 0)
                        throw new InvalidOperationException($"Produto com ID {item.ProdutoId} não encontrado");
                }

                using var command = new MySqlCommand(@"
                    UPDATE item_nfe 
                    SET nfe_id = @nfeId,
                        produto_id = @produtoId,
                        quantidade = @quantidade,
                        valor_unitario = @valorUnitario,
                        valor_total = @valorTotal
                        /* remova 'desconto = @desconto' daqui */
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametrosSemDesconto(command, item);
                
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
                    "DELETE FROM item_nfe WHERE id = @id", 
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

        public async Task<bool> Delete(string nfeKey, int ordem)
        {
            using var connection = new MySqlConnection(_connection.ConnectionString);
            await connection.OpenAsync();
            
            var sql = "DELETE FROM Item_NFE WHERE KeyAcess_NFE = @Key AND Ordem = @Ordem";
            var rowsAffected = await connection.ExecuteAsync(sql, new { Key = nfeKey, Ordem = ordem });
            
            return rowsAffected > 0;
        }

        public async Task<IEnumerable<ItemNFE>> ReadByNfeId(long nfeId)
        {
            return await ReadByNFE(nfeId);
        }

        private void PreencherParametros(MySqlCommand command, ItemNFE item)
        {
            command.Parameters.AddWithValue("@nfeId", item.NfeId);
            command.Parameters.AddWithValue("@produtoId", item.ProdutoId);
            command.Parameters.AddWithValue("@quantidade", item.Quantidade);
            command.Parameters.AddWithValue("@valorUnitario", item.ValorUnitario);
            command.Parameters.AddWithValue("@valorTotal", item.ValorTotal);
            command.Parameters.AddWithValue("@desconto", item.Desconto);
        }

        // Novo método para preencher parâmetros sem desconto
        private void PreencherParametrosSemDesconto(MySqlCommand command, ItemNFE item)
        {
            command.Parameters.AddWithValue("@nfeId", item.NfeId);
            command.Parameters.AddWithValue("@produtoId", item.ProdutoId);
            command.Parameters.AddWithValue("@quantidade", item.Quantidade);
            command.Parameters.AddWithValue("@valorUnitario", item.ValorUnitario);
            command.Parameters.AddWithValue("@valorTotal", item.ValorTotal);
            // Remova o parâmetro desconto
            // command.Parameters.AddWithValue("@desconto", item.Desconto);
        }

        private ItemNFE MapearItemNFE(MySqlDataReader reader)
        {
            var itemNFE = new ItemNFE
            {
                Id = reader.GetInt64("id"),
                NfeId = reader.GetInt64("nfe_id"),
                ProdutoId = reader.GetInt64("produto_id"),
                Quantidade = reader.GetDecimal("quantidade"),
                ValorUnitario = reader.GetDecimal("valor_unitario"),
                ValorTotal = reader.GetDecimal("valor_total"),
                // Defina desconto como 0 por padrão
                Desconto = 0, // Valor padrão em vez de ler do banco
                NFE = !reader.IsDBNull(reader.GetOrdinal("nfe_numero")) 
                    ? new NFE 
                    { 
                        Id = reader.GetInt64("nfe_id"),
                        Numero = reader.GetString("nfe_numero")
                    } 
                    : null,
                Produto = !reader.IsDBNull(reader.GetOrdinal("produto_descricao")) 
                    ? new Produto 
                    { 
                        Id = reader.GetInt64("produto_id"),
                        Descricao = reader.GetString("produto_descricao")
                    } 
                    : null
            };

            // Remova esta linha, está duplicando a atribuição e causando o erro
            // itemNFE.Desconto = reader.GetDecimal("desconto");

            return itemNFE;
        }
    }
}
