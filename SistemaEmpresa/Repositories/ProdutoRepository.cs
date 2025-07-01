using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaEmpresa.Repositories
{
    public class ProdutoRepository
    {
        private readonly MySqlConnection _connection;

        public ProdutoRepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<List<Produto>> ReadAll()
        {
            var produtos = new List<Produto>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT p.* 
                    FROM produto p
                    WHERE p.ativo = 1
                    ORDER BY p.nome", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    produtos.Add(MapearProduto(reader));
                }
                
                return produtos;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<Produto?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT p.* 
                    FROM produto p
                    WHERE p.id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearProduto(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<IEnumerable<Produto>> ReadByName(string nome)
        {
            // Implement the method to search products by name
            var produtos = await ReadAll();
            return produtos.Where(p => p.Nome.Contains(nome, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<bool> Create(Produto produto)
        {
            try
            {
                await _connection.OpenAsync();

                using var command = new MySqlCommand(@"
                    INSERT INTO produto (nome, descricao, ativo, unidademedidaid, codbarras, referencia, marcaid, categoriaid, quantidademinima, valorcompra, valorvenda, quantidade, percentuallucro, observacoes, situacao, datacriacao, dataalteracao, usercriacao, useratualizacao)
                    VALUES (@nome, @descricao, @ativo, @unidademedidaid, @codbarras, @referencia, @marcaid, @categoriaid, @quantidademinima, @valorcompra, @valorvenda, @quantidade, @percentuallucro, @observacoes, @situacao, @datacriacao, @dataalteracao, @usercriacao, @useratualizacao);
                    SELECT LAST_INSERT_ID();", _connection);
                
                PreencherParametros(command, produto);
                
                var id = Convert.ToInt64(await command.ExecuteScalarAsync());
                produto.Id = id;
                
                return id > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, Produto produto)
        {
            try
            {
                await _connection.OpenAsync();

                using var command = new MySqlCommand(@"
                    UPDATE produto 
                    SET nome = @nome,
                        descricao = @descricao,
                        ativo = @ativo,
                        unidademedidaid = @unidademedidaid,
                        codbarras = @codbarras,
                        referencia = @referencia,
                        marcaid = @marcaid,
                        categoriaid = @categoriaid,
                        quantidademinima = @quantidademinima,
                        valorcompra = @valorcompra,
                        valorvenda = @valorvenda,
                        quantidade = @quantidade,
                        percentuallucro = @percentuallucro,
                        observacoes = @observacoes,
                        situacao = @situacao,
                        datacriacao = @datacriacao,
                        dataalteracao = @dataalteracao,
                        usercriacao = @usercriacao,
                        useratualizacao = @useratualizacao
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, produto);
                
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
                
                using var command = new MySqlCommand(@"
                    UPDATE produto 
                    SET ativo = 0 
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        private void PreencherParametros(MySqlCommand command, Produto produto)
        {
            command.Parameters.AddWithValue("@nome", produto.Nome?.ToUpper());
            command.Parameters.AddWithValue("@descricao", produto.Descricao != null ? produto.Descricao.ToUpper() : (object)DBNull.Value);
            command.Parameters.AddWithValue("@ativo", produto.Ativo);
            command.Parameters.AddWithValue("@unidademedidaid", produto.UnidadeMedidaId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@codbarras", produto.CodigoBarras != null ? produto.CodigoBarras.ToUpper() : (object)DBNull.Value);
            command.Parameters.AddWithValue("@referencia", produto.Referencia != null ? produto.Referencia.ToUpper() : (object)DBNull.Value);
            command.Parameters.AddWithValue("@marcaid", produto.MarcaId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@categoriaid", produto.CategoriaId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@quantidademinima", produto.QuantidadeMinima ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@valorcompra", produto.ValorCompra ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@valorvenda", produto.ValorVenda ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@quantidade", produto.Quantidade ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@percentuallucro", produto.PercentualLucro ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@observacoes", produto.Observacoes != null ? produto.Observacoes.ToUpper() : (object)DBNull.Value);
            command.Parameters.AddWithValue("@situacao", produto.Situacao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@datacriacao", produto.DataCriacao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@dataalteracao", produto.DataAlteracao ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@usercriacao", produto.UserCriacao != null ? produto.UserCriacao.ToUpper() : (object)DBNull.Value);
            command.Parameters.AddWithValue("@useratualizacao", produto.UserAtualizacao != null ? produto.UserAtualizacao.ToUpper() : (object)DBNull.Value);
        }

        private Produto MapearProduto(MySqlDataReader reader)
        {
            return new Produto
            {
                Id = reader.GetInt64("id"),
                Nome = reader.GetString("nome"),
                Descricao = reader.IsDBNull(reader.GetOrdinal("descricao")) 
                    ? null 
                    : reader.GetString("descricao"),
                Ativo = reader.GetBoolean("ativo"),
                UnidadeMedidaId = reader.IsDBNull(reader.GetOrdinal("unidademedidaid")) ? null : reader.GetInt32("unidademedidaid"),
                CodigoBarras = reader.IsDBNull(reader.GetOrdinal("codbarras")) ? null : reader.GetString("codbarras"),
                Referencia = reader.IsDBNull(reader.GetOrdinal("referencia")) ? null : reader.GetString("referencia"),
                MarcaId = reader.IsDBNull(reader.GetOrdinal("marcaid")) ? null : reader.GetInt32("marcaid"),
                CategoriaId = reader.IsDBNull(reader.GetOrdinal("categoriaid")) ? null : reader.GetInt32("categoriaid"),
                QuantidadeMinima = reader.IsDBNull(reader.GetOrdinal("quantidademinima")) ? null : reader.GetInt32("quantidademinima"),
                ValorCompra = reader.IsDBNull(reader.GetOrdinal("valorcompra")) ? null : reader.GetDecimal("valorcompra"),
                ValorVenda = reader.IsDBNull(reader.GetOrdinal("valorvenda")) ? null : reader.GetDecimal("valorvenda"),
                Quantidade = reader.IsDBNull(reader.GetOrdinal("quantidade")) ? null : reader.GetInt32("quantidade"),
                PercentualLucro = reader.IsDBNull(reader.GetOrdinal("percentuallucro")) ? null : reader.GetDecimal("percentuallucro"),
                Observacoes = reader.IsDBNull(reader.GetOrdinal("observacoes")) ? null : reader.GetString("observacoes"),
                Situacao = reader.IsDBNull(reader.GetOrdinal("situacao")) ? null : reader.GetDateTime("situacao"),
                DataCriacao = reader.IsDBNull(reader.GetOrdinal("datacriacao")) ? null : reader.GetDateTime("datacriacao"),
                DataAlteracao = reader.IsDBNull(reader.GetOrdinal("dataalteracao")) ? null : reader.GetDateTime("dataalteracao"),
                UserCriacao = reader.IsDBNull(reader.GetOrdinal("usercriacao")) ? null : reader.GetString("usercriacao"),
                UserAtualizacao = reader.IsDBNull(reader.GetOrdinal("useratualizacao")) ? null : reader.GetString("useratualizacao")
            };
        }
    }
}
