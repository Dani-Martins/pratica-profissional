using SistemaEmpresa.Exceptions;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.Services
{
    public class VeiculoService
    {
        private readonly VeiculoRepository _veiculoRepository;
        private readonly TransportadoraRepository _transportadoraRepository;

        public VeiculoService(VeiculoRepository veiculoRepository, TransportadoraRepository transportadoraRepository)
        {
            _veiculoRepository = veiculoRepository;
            _transportadoraRepository = transportadoraRepository;
        }

        public async Task<IEnumerable<Veiculo>> GetAllAsync()
        {
            return await _veiculoRepository.ReadAll();
        }

        public async Task<Veiculo> GetByIdAsync(long id)
        {
            var veiculo = await _veiculoRepository.ReadById(id);
            if (veiculo == null)
                throw new Exception($"Veículo não encontrado com o ID: {id}");
            return veiculo;
        }

        public async Task<IEnumerable<Veiculo>> GetByTransportadoraIdAsync(long transportadoraId)
        {
            return await _veiculoRepository.ReadByTransportadoraId(transportadoraId);
        }

        public async Task<Veiculo> SaveAsync(Veiculo veiculo)
        {
            // Validar transportadora
            if (!veiculo.TransportadoraId.HasValue)
                throw new SistemaEmpresa.Exceptions.ValidationException("O ID da transportadora é obrigatório");
            var transportadora = await _transportadoraRepository.ReadById(veiculo.TransportadoraId.Value);
            if (transportadora == null)
                throw new SistemaEmpresa.Exceptions.ValidationException($"Transportadora não encontrada com o ID: {veiculo.TransportadoraId}");

            // Validar placa única
            if (veiculo.Id == 0 && await ExistePlaca(veiculo.Placa))
                throw new SistemaEmpresa.Exceptions.ValidationException("Já existe um veículo com esta placa");

            if (veiculo.Id == 0)
            {
                await _veiculoRepository.Create(veiculo);
            }
            else
            {
                await _veiculoRepository.Update(veiculo.Id, veiculo);
            }
            return veiculo;
        }

        public async Task DeleteAsync(long id)
        {
            await _veiculoRepository.Delete(id);
        }

        public async Task<bool> ExistePlaca(string placa)
        {
            var veiculos = await _veiculoRepository.ReadAll();
            return veiculos.Any(v => v.Placa == placa);
        }
    }
}