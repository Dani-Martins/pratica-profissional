using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class CondicaoPagamentoService
    {
        private readonly CondicaoPagamentoRepository _repository;
        private readonly ParcelaCondicaoPagamentoRepository _parcelaRepository;

        public CondicaoPagamentoService(
            CondicaoPagamentoRepository repository, 
            ParcelaCondicaoPagamentoRepository parcelaRepository)
        {
            _repository = repository;
            _parcelaRepository = parcelaRepository;
        }

        public async Task<IEnumerable<CondicaoPagamentoDTO>> GetAll()
        {
            var condicoes = await _repository.GetAll();
            return condicoes.Select(MapToDTO);
        }

        public async Task<CondicaoPagamentoDTO> GetById(long id)
        {
            var condicao = await _repository.GetById(id);
            if (condicao == null)
                return null;
                
            return MapToDTO(condicao);
        }

        public async Task<CondicaoPagamentoDTO> Create(CondicaoPagamentoCreateDTO dto)
        {
            // Validar se código já existe
            if (await _repository.Exists(dto.Codigo))
                throw new InvalidOperationException($"Já existe uma condição de pagamento com o código '{dto.Codigo}'");
                
            // Validar percentuais das parcelas
            if (dto.Parcelas != null && dto.Parcelas.Any())
            {
                decimal totalPercentual = dto.Parcelas.Sum(p => p.Percentual);
                if (Math.Abs(totalPercentual - 100) > 0.01m)
                {
                    throw new InvalidOperationException($"O total dos percentuais das parcelas deve ser 100%. Total atual: {totalPercentual}%");
                }
            }

            // Converter DTO para entidade
            var condicaoPagamento = new CondicaoPagamento
            {
                Codigo = dto.Codigo,
                Descricao = dto.Descricao,
                AVista = dto.AVista,
                Ativo = dto.Ativo,
                PercentualJuros = dto.PercentualJuros,
                PercentualMulta = dto.PercentualMulta,
                PercentualDesconto = dto.PercentualDesconto
            };

            // Criar a condição de pagamento
            var created = await _repository.Create(condicaoPagamento);

            // Adicionar as parcelas
            if (dto.Parcelas != null && dto.Parcelas.Any())
            {
                foreach (var parcelaDto in dto.Parcelas)
                {
                    var parcela = new ParcelaCondicaoPagamento
                    {
                        CondicaoPagamentoId = created.Id,
                        Numero = parcelaDto.Numero,
                        Dias = parcelaDto.Dias,
                        Percentual = parcelaDto.Percentual,
                        FormaPagamentoId = parcelaDto.FormaPagamentoId
                    };
                    
                    await _parcelaRepository.Create(parcela);
                }
            }

            return await GetById(created.Id);
        }

        public async Task<CondicaoPagamentoDTO> Update(long id, CondicaoPagamentoUpdateDTO dto)
        {
            // Validar se a condição existe
            var existingCondicao = await _repository.GetById(id);
            if (existingCondicao == null)
                return null;

            // Validar se código já existe (para outro registro)
            if (dto.Codigo != existingCondicao.Codigo && await _repository.Exists(dto.Codigo, id))
                throw new InvalidOperationException($"Já existe uma condição de pagamento com o código '{dto.Codigo}'");
                
            // Validar percentuais das parcelas
            if (dto.Parcelas != null && dto.Parcelas.Any())
            {
                decimal totalPercentual = dto.Parcelas.Sum(p => p.Percentual);
                if (Math.Abs(totalPercentual - 100) > 0.01m)
                {
                    throw new InvalidOperationException($"O total dos percentuais das parcelas deve ser 100%. Total atual: {totalPercentual}%");
                }
            }

            // Atualizar os dados da condição de pagamento
            existingCondicao.Codigo = dto.Codigo;
            existingCondicao.Descricao = dto.Descricao;
            existingCondicao.AVista = dto.AVista;
            existingCondicao.Ativo = dto.Ativo;
            existingCondicao.PercentualJuros = dto.PercentualJuros;
            existingCondicao.PercentualMulta = dto.PercentualMulta;
            existingCondicao.PercentualDesconto = dto.PercentualDesconto;

            await _repository.Update(existingCondicao);
            
            // Remover parcelas existentes para substituir pelas novas
            await _parcelaRepository.DeleteByCondicaoPagamentoId(id);
            
            // Adicionar as novas parcelas
            if (dto.Parcelas != null && dto.Parcelas.Any())
            {
                foreach (var parcelaDto in dto.Parcelas.OrderBy(p => p.Numero))
                {
                    var parcela = new ParcelaCondicaoPagamento
                    {
                        CondicaoPagamentoId = id,
                        Numero = parcelaDto.Numero,
                        Dias = parcelaDto.Dias,
                        Percentual = parcelaDto.Percentual,
                        FormaPagamentoId = parcelaDto.FormaPagamentoId
                    };
                    
                    await _parcelaRepository.Create(parcela);
                }
            }

            return await GetById(id);
        }

        public async Task<bool> Delete(long id)
        {
            return await _repository.Delete(id);
        }

        // Método auxiliar para mapear entidade para DTO
        private CondicaoPagamentoDTO MapToDTO(CondicaoPagamento condicao)
        {
            return new CondicaoPagamentoDTO
            {
                Id = condicao.Id,
                Codigo = condicao.Codigo,
                Descricao = condicao.Descricao ?? string.Empty,
                AVista = condicao.AVista,
                Ativo = condicao.Ativo,
                PercentualJuros = condicao.PercentualJuros,
                PercentualMulta = condicao.PercentualMulta,
                PercentualDesconto = condicao.PercentualDesconto,
                Parcelas = condicao.Parcelas
                    .Select(p => new ParcelaCondicaoPagamentoDTO
                    {
                        Id = p.Id,
                        CondicaoPagamentoId = p.CondicaoPagamentoId,
                        Numero = p.Numero,
                        Dias = p.Dias,
                        Percentual = p.Percentual,
                        FormaPagamentoId = p.FormaPagamentoId,
                        FormaPagamentoDescricao = p.FormaPagamento?.Descricao ?? string.Empty
                    })
                    .OrderBy(p => p.Numero)
                    .ToList(),
                // Mapeamento seguro para os campos existentes
                DataCriacao = condicao.DataCadastro,
                UserCriacao = "Sistema",
                DataAlteracao = null,
                UserAtualizacao = null
            };
        }
    }
}