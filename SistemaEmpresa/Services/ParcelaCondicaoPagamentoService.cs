using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class ParcelaCondicaoPagamentoService
    {
        private readonly ParcelaCondicaoPagamentoRepository _repository;
        private readonly CondicaoPagamentoRepository _condicaoPagamentoRepository;
        private readonly FormaPagamentoRepository _formaPagamentoRepository;

        public ParcelaCondicaoPagamentoService(
            ParcelaCondicaoPagamentoRepository repository,
            CondicaoPagamentoRepository condicaoPagamentoRepository,
            FormaPagamentoRepository formaPagamentoRepository)
        {
            _repository = repository;
            _condicaoPagamentoRepository = condicaoPagamentoRepository;
            _formaPagamentoRepository = formaPagamentoRepository;
        }

        public async Task<IEnumerable<ParcelaCondicaoPagamentoDTO>> GetByCondicaoPagamentoId(long condicaoPagamentoId)
        {
            // Verificar se a condição de pagamento existe
            var condicao = await _condicaoPagamentoRepository.GetById(condicaoPagamentoId);
            if (condicao == null)
                throw new KeyNotFoundException($"Condição de pagamento com ID {condicaoPagamentoId} não encontrada");

            var parcelas = await _repository.GetByCondicaoPagamentoId(condicaoPagamentoId);
            return parcelas.Select(MapToDTO);
        }

        public async Task<ParcelaCondicaoPagamentoDTO> GetById(long id)
        {
            var parcela = await _repository.GetById(id);
            if (parcela == null)
                return null;

            return MapToDTO(parcela);
        }

        public async Task<ParcelaCondicaoPagamentoDTO> Create(long condicaoPagamentoId, ParcelaCondicaoPagamentoCreateDTO dto)
        {
            // Verificar se a condição de pagamento existe
            var condicao = await _condicaoPagamentoRepository.GetById(condicaoPagamentoId);
            if (condicao == null)
                throw new KeyNotFoundException($"Condição de pagamento com ID {condicaoPagamentoId} não encontrada");

            // Verificar se o número da parcela já existe para esta condição
            var parcelas = await _repository.GetByCondicaoPagamentoId(condicaoPagamentoId);
            if (parcelas.Any(p => p.Numero == dto.Numero))
                throw new InvalidOperationException($"Já existe uma parcela com número {dto.Numero} para esta condição de pagamento");

            // Resolver ID da forma de pagamento
            var formaPagamentoId = await ResolveFormaPagamentoId(dto);

            var parcela = new ParcelaCondicaoPagamento
            {
                CondicaoPagamentoId = condicaoPagamentoId,
                Numero = dto.Numero,
                Dias = dto.Dias,
                Percentual = dto.Percentual,
                FormaPagamentoId = formaPagamentoId
            };

            var created = await _repository.Create(parcela);
            return await GetById(created.Id);
        }

        public async Task<ParcelaCondicaoPagamentoDTO> Update(long id, ParcelaCondicaoPagamentoUpdateDTO dto)
        {
            // Verificar se a parcela existe
            var existingParcela = await _repository.GetById(id);
            if (existingParcela == null)
                return null;

            // Usar o CondicaoPagamentoId da parcela existente
            var condicaoPagamentoId = existingParcela.CondicaoPagamentoId;
            
            // Verificar se a condição de pagamento existe
            var condicao = await _condicaoPagamentoRepository.GetById(condicaoPagamentoId);
            if (condicao == null)
                throw new KeyNotFoundException($"Condição de pagamento com ID {condicaoPagamentoId} não encontrada");

            // Verificar se o número da parcela já existe para esta condição (excluindo a parcela atual)
            var parcelas = await _repository.GetByCondicaoPagamentoId(condicaoPagamentoId);
            if (parcelas.Any(p => p.Numero == dto.Numero && p.Id != id))
                throw new InvalidOperationException($"Já existe uma parcela com número {dto.Numero} para esta condição de pagamento");

            var parcela = new ParcelaCondicaoPagamento
            {
                Id = id,
                CondicaoPagamentoId = condicaoPagamentoId,
                Numero = dto.Numero,
                Dias = dto.Dias,
                Percentual = dto.Percentual,
                FormaPagamentoId = dto.FormaPagamentoId // Agora usa o valor do DTO
            };

            await _repository.Update(parcela);
            return await GetById(id);
        }

        public async Task<bool> Delete(long id)
        {
            return await _repository.Delete(id);
        }

        // Métodos auxiliares
        private async Task<long?> ResolveFormaPagamentoId(ParcelaCondicaoPagamentoCreateDTO dto)
        {
            // Se já tiver ID, usar diretamente
            if (dto.FormaPagamentoId.HasValue)
                return dto.FormaPagamentoId;

            // Tentar usar FormaPagamento como string e converter para ID
            if (!string.IsNullOrEmpty(dto.FormaPagamento))
            {
                if (long.TryParse(dto.FormaPagamento, out long formaPagamentoId))
                    return formaPagamentoId;

                // Procurar por nome/descrição
                var formaPagamento = await _formaPagamentoRepository.GetByDescricao(dto.FormaPagamento);
                if (formaPagamento != null)
                    return formaPagamento.Id;
            }

            return null;
        }
        
        private async Task<long?> ResolveFormaPagamentoId(ParcelaCondicaoPagamentoUpdateDTO dto)
        {
            // Como não temos a propriedade FormaPagamentoId ou FormaPagamento no DTO de atualização,
            // precisamos modificar a lógica de atualização
            
            // Se você deseja adicionar suporte para atualizar a forma de pagamento,
            // você precisará adicionar a propriedade ao DTO e modificar esta lógica

            // Por enquanto, retornamos null para manter a forma de pagamento existente
            return null;
        }

        private ParcelaCondicaoPagamentoDTO MapToDTO(ParcelaCondicaoPagamento parcela)
        {
            return new ParcelaCondicaoPagamentoDTO
            {
                Id = parcela.Id,
                CondicaoPagamentoId = parcela.CondicaoPagamentoId,
                Numero = parcela.Numero,
                Dias = parcela.Dias,
                Percentual = parcela.Percentual,
                FormaPagamentoId = parcela.FormaPagamentoId,
                FormaPagamentoDescricao = parcela.FormaPagamento?.Descricao ?? string.Empty
            };
        }
    }
}