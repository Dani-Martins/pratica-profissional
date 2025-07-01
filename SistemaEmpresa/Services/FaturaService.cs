using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class FaturaService
    {
        private readonly FaturaRepository _faturaRepository;

        public FaturaService(FaturaRepository faturaRepository)
        {
            _faturaRepository = faturaRepository;
        }

        public async Task<IEnumerable<Fatura>> GetAllAsync()
        {
            return await _faturaRepository.ReadAll();
        }

        public async Task<Fatura> GetByIdAsync(long id)
        {
            var fatura = await _faturaRepository.ReadById(id);
            if (fatura == null)
                throw new Exception($"Fatura não encontrada com o ID: {id}");
            return fatura;
        }

        public async Task<Fatura> SaveAsync(Fatura fatura)
        {
            if (fatura.Id == 0)
            {
                await _faturaRepository.Create(fatura);
            }
            else
            {
                await _faturaRepository.Update(fatura.Id, fatura);
            }
            return fatura;
        }

        public async Task DeleteAsync(long id)
        {
            await _faturaRepository.Delete(id);
        }
    }
}