using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using System.Linq;

namespace SistemaEmpresa.Services
{
    public class ProdutoService
    {
        private readonly ProdutoRepository _produtoRepository;

        public ProdutoService(ProdutoRepository produtoRepository)
        {
            _produtoRepository = produtoRepository;
        }

        public async Task<IEnumerable<Produto>> GetAllAsync()
        {
            return await _produtoRepository.ReadAll();
        }

        public async Task<Produto> GetByIdAsync(long id)
        {
            var produto = await _produtoRepository.ReadById(id);
            if (produto == null)
                throw new Exception($"Produto não encontrado com o ID: {id}");
            return produto;
        }

        public async Task<IEnumerable<Produto>> GetByNameAsync(string nome)
        {
            return await _produtoRepository.ReadByName(nome);
        }        public async Task<Produto> SaveAsync(Produto produto)
        {
            // Validações
            if (string.IsNullOrWhiteSpace(produto.Nome))
                throw new Exception("O nome do produto é obrigatório");

            // Validação dos novos campos (exemplo: valor de venda não pode ser menor que valor de compra)
            if (produto.ValorVenda.HasValue && produto.ValorCompra.HasValue && produto.ValorVenda < produto.ValorCompra)
                throw new Exception("O valor de venda não pode ser menor que o valor de compra.");

            // Definir campos de auditoria
            if (produto.Id == 0)
            {
                produto.DataCriacao = DateTime.Now;
                produto.UserCriacao = produto.UserCriacao ?? "Sistema";
                await _produtoRepository.Create(produto);
            }
            else
            {
                var produtoExistente = await _produtoRepository.ReadById(produto.Id);
                if (produtoExistente == null)
                    throw new Exception($"Produto não encontrado com o ID: {produto.Id}");
                
                // Manter os dados originais de criação
                produto.DataCriacao = produtoExistente.DataCriacao;
                produto.UserCriacao = produtoExistente.UserCriacao;
                
                // Atualizar dados de alteração
                produto.DataAlteracao = DateTime.Now;
                produto.UserAtualizacao = produto.UserAtualizacao ?? "Sistema";
                
                await _produtoRepository.Update(produto.Id, produto);
            }
            return produto;
        }

        public async Task DeleteAsync(long id)
        {
            var produto = await _produtoRepository.ReadById(id);
            if (produto == null)
                throw new Exception($"Produto não encontrado com o ID: {id}");

            await _produtoRepository.Delete(id);
        }
    }
}