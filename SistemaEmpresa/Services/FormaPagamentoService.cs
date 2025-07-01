using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using SistemaEmpresa.DTOs;

namespace SistemaEmpresa.Services
{
    public class FormaPagamentoService
    {
        private readonly FormaPagamentoRepository _repository;

        public FormaPagamentoService(FormaPagamentoRepository repository)
        {
            _repository = repository;
        }        public async Task<IEnumerable<FormaPagamentoDTO>> GetAll()
        {
            var formasPagamento = await _repository.GetAll();
              return formasPagamento.Select(fp => new FormaPagamentoDTO
            {
                Id = fp.Id,
                Descricao = fp.Descricao,
                Situacao = fp.Situacao, // Agora ambos são byte
                DataCriacao = fp.DataCriacao,
                DataAlteracao = fp.DataAlteracao,
                UserCriacao = fp.UserCriacao,
                UserAtualizacao = fp.UserAtualizacao
            });
        }        public async Task<FormaPagamentoDTO?> GetById(long id)
        {
            var formaPagamento = await _repository.GetById(id);
            
            if (formaPagamento == null)
                return null;
                  return new FormaPagamentoDTO
            {
                Id = formaPagamento.Id,
                Descricao = formaPagamento.Descricao,
                Situacao = formaPagamento.Situacao, // Agora ambos são byte
                DataCriacao = formaPagamento.DataCriacao,
                DataAlteracao = formaPagamento.DataAlteracao,
                UserCriacao = formaPagamento.UserCriacao,
                UserAtualizacao = formaPagamento.UserAtualizacao
            };
        }        public async Task<FormaPagamentoDTO> Create(FormaPagamentoCreateDTO dto)
        {
            try
            {
                Console.WriteLine($"SERVICE - Iniciando criação da forma de pagamento: '{dto.Descricao}'");
                  // Garantir que a situação é sempre 1 (ativo) para novos registros
                var formaPagamento = new FormaPagamento
                {
                    Descricao = !string.IsNullOrWhiteSpace(dto.Descricao) ? dto.Descricao : "Nova Forma de Pagamento",
                    Situacao = 1, // Força para 1 (ativo), independente do que foi enviado
                    DataCriacao = DateTime.Now,
                    UserCriacao = !string.IsNullOrWhiteSpace(dto.UserCriacao) ? dto.UserCriacao : "Sistema"
                };
                
                Console.WriteLine($"SERVICE - Objeto FormaPagamento criado: Descricao='{formaPagamento.Descricao}', Situacao={formaPagamento.Situacao}, UserCriacao='{formaPagamento.UserCriacao}'");
                
                var created = await _repository.Create(formaPagamento);
                
                Console.WriteLine($"SERVICE - FormaPagamento criada no banco com ID: {created.Id}");
                  return new FormaPagamentoDTO
                {
                    Id = created.Id,
                    Descricao = created.Descricao,
                    Situacao = created.Situacao, // Agora ambos são byte
                    DataCriacao = created.DataCriacao,
                    DataAlteracao = created.DataAlteracao,
                    UserCriacao = created.UserCriacao,
                    UserAtualizacao = created.UserAtualizacao
                };
            }
            catch (Exception ex)
            {
                // Logar o erro para diagnóstico
                Console.WriteLine($"SERVICE - ERRO ao criar forma de pagamento: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"SERVICE - Inner exception: {ex.InnerException.Message}");
                }
                throw; // Relançar a exceção para tratamento no controller
            }
        }public async Task<FormaPagamentoDTO?> Update(long id, FormaPagamentoUpdateDTO dto)
        {
            var formaPagamento = new FormaPagamento
            {
                Descricao = dto.Descricao,
                Situacao = dto.Situacao, // Agora ambos são byte
                UserAtualizacao = dto.UserAtualizacao ?? "Sistema"
            };
            
            var updated = await _repository.Update(id, formaPagamento);
            
            if (updated == null)
                return null;
                
            return new FormaPagamentoDTO
            {
                Id = updated.Id,
                Descricao = updated.Descricao,
                Situacao = updated.Situacao, // Agora ambos são byte
                DataCriacao = updated.DataCriacao,
                DataAlteracao = updated.DataAlteracao,
                UserCriacao = updated.UserCriacao,
                UserAtualizacao = updated.UserAtualizacao
            };
        }

        public async Task<bool> Delete(long id)
        {
            return await _repository.Delete(id);
        }
    }
}