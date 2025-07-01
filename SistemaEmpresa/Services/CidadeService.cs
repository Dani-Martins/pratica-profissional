using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;
using Dapper;
using Microsoft.Extensions.Configuration;
using System;

namespace SistemaEmpresa.Services
{
    public class CidadeService
    {
        private readonly CidadeRepository _cidadeRepository;
        private readonly EstadoRepository _estadoRepository;
        private readonly string _connectionString;

        public CidadeService(CidadeRepository cidadeRepository, EstadoRepository estadoRepository, IConfiguration configuration)
        {
            _cidadeRepository = cidadeRepository;
            _estadoRepository = estadoRepository;
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<IEnumerable<Cidade>> GetAllAsync()
        {
            return await _cidadeRepository.ReadAll();
        }

        public async Task<Cidade> GetByIdAsync(long id)
        {
            var cidade = await _cidadeRepository.ReadById(id);
            if (cidade == null)
                throw new Exception($"Cidade não encontrada com o ID: {id}");
            return cidade;
        }

        public async Task<IEnumerable<Cidade>> GetByEstadoIdAsync(long estadoId)
        {
            return await _cidadeRepository.ReadByEstadoId(estadoId);
        }

        public async Task<Cidade> SaveAsync(Cidade cidade)
        {
            // Validações
            if (string.IsNullOrWhiteSpace(cidade.Nome))
                throw new Exception("O nome da cidade é obrigatório");
                
            if (cidade.EstadoId <= 0)
                throw new Exception("O ID do estado é obrigatório");

            // Verificar se o estado existe
            var estado = await _estadoRepository.ReadById(cidade.EstadoId);
            if (estado == null)
                throw new Exception($"Estado não encontrado com o ID: {cidade.EstadoId}");

            if (cidade.Id == 0)
            {
                await _cidadeRepository.Create(cidade);
            }
            else
            {
                await _cidadeRepository.Update(cidade.Id, cidade);
            }
            
            return cidade;
        }

        public async Task DeleteAsync(long id)
        {
            var cidade = await _cidadeRepository.ReadById(id);
            if (cidade == null)
                throw new Exception($"Cidade não encontrada com o ID: {id}");

            await _cidadeRepository.Delete(id);
        }

        /// <summary>
        /// Obtém um estado pelo ID
        /// </summary>
        /// <param name="estadoId">ID do estado a ser buscado</param>
        /// <returns>O estado encontrado ou null se não existir</returns>
        public async Task<Estado?> GetEstadoByIdAsync(long estadoId)
        {
            // Implemente a lógica para buscar um estado pelo ID
            // Exemplo: return await _context.Estados.FindAsync(estadoId);
            var estadoDTO = await _estadoRepository.ReadById(estadoId);
            if (estadoDTO == null) return null;
            
            // Converter de EstadoDTO para Estado
            return new Estado
            {
                Id = (int)estadoDTO.Id,
                Nome = estadoDTO.Nome
                // Remova Sigla se não existir na classe Estado ou adicione a propriedade na classe
                // Adicione outros campos conforme necessário
            };
        }

        public async Task<Cidade> CreateAlternativeAsync(Cidade cidade)
        {
            try
            {
                // Use o método alternativo do repositório
                await _cidadeRepository.CreateAlternative(cidade);
                return cidade;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro no CidadeService.CreateAlternativeAsync: {ex.Message}");
                throw;
            }
        }

        public async Task InsercaoDiretaDebug(string nome, string codigoIbge, long estadoId)
        {
            try
            {
                // Abrir conexão direta com o banco
                await _cidadeRepository.InsercaoDireta(nome, codigoIbge, estadoId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em InsercaoDiretaDebug: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> TemDependencias(long cidadeId)
        {
            try
            {
                // Adicione logs detalhados para diagnóstico
                Console.WriteLine($"Verificando dependências para cidade ID: {cidadeId}");
                
                // Listar todas as tabelas a verificar
                var tabelas = new List<string> { "cliente", "fornecedor", "funcionario", "endereco" };
                Console.WriteLine($"Verificando dependências nas tabelas: {string.Join(", ", tabelas)}");
                
                bool temDependencia = await _cidadeRepository.TemDependencias(cidadeId);
                Console.WriteLine($"Resultado da verificação de dependências: {temDependencia}");
                
                return temDependencia;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERRO ao verificar dependências: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task ExcluirForcado(long id)
        {
            // Use uma conexão direta para maior controle
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            
            // Inicie uma transação para garantir que tudo seja feito ou nada
            using var transaction = await connection.BeginTransactionAsync();
            
            try
            {
                // Desative temporariamente as verificações de chave estrangeira
                await connection.ExecuteAsync("SET FOREIGN_KEY_CHECKS=0;", transaction: transaction);
                
                // Execute o delete diretamente
                await connection.ExecuteAsync(
                    "DELETE FROM cidade WHERE id = @Id", 
                    new { Id = id },
                    transaction: transaction
                );
                
                // Reative as verificações de chave estrangeira
                await connection.ExecuteAsync("SET FOREIGN_KEY_CHECKS=1;", transaction: transaction);
                
                // Confirme as alterações
                await transaction.CommitAsync();
                
                Console.WriteLine($"Cidade {id} excluída com sucesso no modo forçado.");
            }
            catch (Exception ex)
            {
                // Em caso de erro, reverta todas as alterações
                await transaction.RollbackAsync();
                
                Console.WriteLine($"ERRO ao excluir cidade no modo forçado: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}