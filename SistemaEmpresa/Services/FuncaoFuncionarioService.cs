using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SistemaEmpresa.Services
{
    public class FuncaoFuncionarioService
    {
        private readonly FuncaoFuncionarioRepository _funcaoFuncionarioRepository;

        public FuncaoFuncionarioService(FuncaoFuncionarioRepository funcaoFuncionarioRepository)
        {
            _funcaoFuncionarioRepository = funcaoFuncionarioRepository;
        }

        public async Task<IEnumerable<FuncaoFuncionario>> GetAllAsync()
        {
            try
            {
                return await _funcaoFuncionarioRepository.ReadAll();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em FuncaoFuncionarioService.GetAllAsync: {ex.Message}");
                throw new Exception("Erro ao buscar todas as funções de funcionários", ex);
            }
        }

        public async Task<IEnumerable<FuncaoFuncionario>> GetAtivosAsync()
        {
            try
            {
                return await _funcaoFuncionarioRepository.ReadBySituacao("A");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em FuncaoFuncionarioService.GetAtivosAsync: {ex.Message}");
                throw new Exception("Erro ao buscar funções de funcionários ativas", ex);
            }
        }

        public async Task<IEnumerable<FuncaoFuncionario>> GetInativosAsync()
        {
            try
            {
                return await _funcaoFuncionarioRepository.ReadBySituacao("I");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em FuncaoFuncionarioService.GetInativosAsync: {ex.Message}");
                throw new Exception("Erro ao buscar funções de funcionários inativas", ex);
            }
        }

        public async Task<IEnumerable<FuncaoFuncionario>> GetByNameAsync(string nome)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(nome))
                {
                    return await GetAllAsync();
                }

                return await _funcaoFuncionarioRepository.ReadByNome(nome);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em FuncaoFuncionarioService.GetByNameAsync: {ex.Message}");
                throw new Exception($"Erro ao buscar funções de funcionários pelo nome: {nome}", ex);
            }
        }

        public async Task<FuncaoFuncionario> GetByIdAsync(long id)
        {
            try
            {
                var funcaoFuncionario = await _funcaoFuncionarioRepository.ReadById(id);
                
                if (funcaoFuncionario == null)
                {
                    throw new Exception($"Função de funcionário não encontrada com o ID: {id}");
                }
                
                return funcaoFuncionario;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em FuncaoFuncionarioService.GetByIdAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<FuncaoFuncionario> SaveAsync(FuncaoFuncionario funcaoFuncionario)
        {
            try
            {
                // Validações básicas
                if (string.IsNullOrWhiteSpace(funcaoFuncionario.FuncaoFuncionarioNome))
                {
                    throw new Exception("O nome da função é obrigatório");
                }

                if (funcaoFuncionario.CargaHoraria < 0)
                {
                    throw new Exception("A carga horária não pode ser negativa");
                }

                if (funcaoFuncionario.Id == 0)
                {
                    // Novo registro
                    funcaoFuncionario.DataCriacao = DateTime.Now;
                    funcaoFuncionario.DataAlteracao = DateTime.Now;
                    funcaoFuncionario.UserCriacao = "sistema"; // Idealmente, obter do usuário logado
                    funcaoFuncionario.UserAtualizacao = "sistema"; // Idealmente, obter do usuário logado
                    
                    await _funcaoFuncionarioRepository.Create(funcaoFuncionario);
                }
                else
                {
                    // Atualização
                    var funcaoExistente = await _funcaoFuncionarioRepository.ReadById(funcaoFuncionario.Id);
                    if (funcaoExistente == null)
                    {
                        throw new Exception($"Função não encontrada com o ID: {funcaoFuncionario.Id}");
                    }
                    
                    // Manter data de criação original
                    funcaoFuncionario.DataCriacao = funcaoExistente.DataCriacao;
                    funcaoFuncionario.UserCriacao = funcaoExistente.UserCriacao;
                    
                    // Atualizar campos de alteração
                    funcaoFuncionario.DataAlteracao = DateTime.Now;
                    funcaoFuncionario.UserAtualizacao = "sistema"; // Idealmente, obter do usuário logado
                    
                    await _funcaoFuncionarioRepository.Update(funcaoFuncionario.Id, funcaoFuncionario);
                }
                
                return funcaoFuncionario;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em FuncaoFuncionarioService.SaveAsync: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteAsync(long id)
        {
            try
            {
                var funcao = await _funcaoFuncionarioRepository.ReadById(id);
                if (funcao == null)
                {
                    throw new Exception($"Função não encontrada com o ID: {id}");
                }

                // Inativa a função em vez de excluir fisicamente
                await _funcaoFuncionarioRepository.Delete(id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em FuncaoFuncionarioService.DeleteAsync: {ex.Message}");
                throw;
            }
        }
    }
}
