using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class TransportadoraService
    {
        private readonly TransportadoraRepository _transportadoraRepository;

        public TransportadoraService(TransportadoraRepository transportadoraRepository)
        {
            _transportadoraRepository = transportadoraRepository;
        }

        public async Task<IEnumerable<Transportadora>> GetAllAsync()
        {
            return await _transportadoraRepository.ReadAll();
        }

        public async Task<Transportadora> GetByIdAsync(long id)
        {
            var transportadora = await _transportadoraRepository.ReadById(id);
            if (transportadora == null)
                throw new Exception($"Transportadora não encontrada com o ID: {id}");
            return transportadora;
        }

        public async Task<Transportadora> SaveAsync(Transportadora transportadora)
        {
            if (transportadora.Id == 0)
            {
                await _transportadoraRepository.Create(transportadora);
            }
            else
            {
                await _transportadoraRepository.Update(transportadora.Id, transportadora);
            }
            return transportadora;
        }

        public async Task DeleteAsync(long id)
        {
            await _transportadoraRepository.Delete(id);
        }
    }
}