using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;

namespace SistemaEmpresa.Repositories
{
    public class ProdutoFornecedorRepository
    {
        private readonly MySqlConnection _connection;

        public ProdutoFornecedorRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<ProdutoFornecedor>> ReadAll()
        {
            var produtos = new List<ProdutoFornecedor>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT pf.*, 
                           p.descricao as produto_descricao,
                           f.razao_social as fornecedor_razao_social
                    FROM produto_fornecedor pf
                    LEFT JOIN produto p ON pf.produto_id = p.id
                    LEFT JOIN fornecedor f ON pf.fornecedor_id = f.id
                    WHERE pf.ativo = 1
                    ORDER BY pf.codigo", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    produtos.Add(MapearProdutoFornecedor(reader));
                }
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
            
            return produtos;
        }

        public async Task<ProdutoFornecedor?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT pf.*, 
                           p.descricao as produto_descricao,
                           f.razao_social as fornecedor_razao_social
                    FROM produto_fornecedor pf
                    LEFT JOIN produto p ON pf.produto_id = p.id
                    LEFT JOIN fornecedor f ON pf.fornecedor_id = f.id
                    WHERE pf.id = @id AND pf.ativo = 1", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearProdutoFornecedor(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Create(ProdutoFornecedor produtoFornecedor)
        {
            try
            {
                await _connection.OpenAsync();

                using var command = new MySqlCommand(@"
                    INSERT INTO produto_fornecedor (
                        codigo, produto_id, fornecedor_id,
                        codigo_fornecedor, custo, margem,
                        preco_venda, ativo
                    ) VALUES (
                        @codigo, @produtoId, @fornecedorId,
                        @codigoFornecedor, @custo, @margem,
                        @precoVenda, @ativo
                    )", _connection);
                
                PreencherParametros(command, produtoFornecedor);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, ProdutoFornecedor produtoFornecedor)
        {
            try
            {
                await _connection.OpenAsync();

                using var command = new MySqlCommand(@"
                    UPDATE produto_fornecedor 
                    SET codigo = @codigo,
                        produto_id = @produtoId,
                        fornecedor_id = @fornecedorId,
                        codigo_fornecedor = @codigoFornecedor,
                        custo = @custo,
                        margem = @margem,
                        preco_venda = @precoVenda,
                        ativo = @ativo
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, produtoFornecedor);
                
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
                    "UPDATE produto_fornecedor SET ativo = 0 WHERE id = @id", 
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

        private void PreencherParametros(MySqlCommand command, ProdutoFornecedor produtoFornecedor)
        {
            command.Parameters.AddWithValue("@codigo", produtoFornecedor.CodigoProd);
            command.Parameters.AddWithValue("@produtoId", produtoFornecedor.ProdutoId);
            command.Parameters.AddWithValue("@fornecedorId", produtoFornecedor.FornecedorId);
            command.Parameters.AddWithValue("@codigoProd", 
                produtoFornecedor.CodigoProd ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@custo", 
                produtoFornecedor.Custo ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@ativo", produtoFornecedor.Ativo);
        }

        private ProdutoFornecedor MapearProdutoFornecedor(MySqlDataReader reader)
        {
            return new ProdutoFornecedor
            {
                Id = reader.GetInt64("id"),
                CodigoProd = reader.IsDBNull(reader.GetOrdinal("codigo_prod")) ? 
                    null : reader.GetString("codigo_prod"),
                ProdutoId = reader.GetInt64("produto_id"),
                FornecedorId = reader.GetInt64("fornecedor_id"),
                Custo = reader.IsDBNull(reader.GetOrdinal("custo")) ? 
                    null : reader.GetDecimal("custo"),
                Ativo = reader.GetBoolean("ativo"),
                Produto = new Produto 
                { 
                    Id = reader.GetInt64("produto_id"),
                    Descricao = reader.GetString("produto_descricao")
                },
                Fornecedor = new Fornecedor
                {
                    Id = reader.GetInt64("fornecedor_id"),
                    RazaoSocial = reader.GetString("fornecedor_razao_social")
                }
            };
        }
    }
}