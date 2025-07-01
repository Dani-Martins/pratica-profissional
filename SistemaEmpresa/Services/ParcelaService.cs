using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class ParcelaService
    {
        private readonly ParcelaRepository _parcelaRepository;
        private readonly FaturaRepository _faturaRepository;

        public ParcelaService(
            ParcelaRepository parcelaRepository,
            FaturaRepository faturaRepository)
        {
            _parcelaRepository = parcelaRepository;
            _faturaRepository = faturaRepository;
        }

        public async Task<IEnumerable<Parcela>> GetAllAsync()
        {
            return await _parcelaRepository.ReadAll();
        }

        public async Task<Parcela> GetByIdAsync(long id)
        {
            var parcela = await _parcelaRepository.ReadById(id);
            if (parcela == null)
                throw new Exception($"Parcela não encontrada com o ID: {id}");
            return parcela;
        }

        public async Task<IEnumerable<Parcela>> GetByFaturaIdAsync(long faturaId)
        {
            var fatura = await _faturaRepository.ReadById(faturaId);
            if (fatura == null)
                throw new Exception($"Fatura não encontrada com o ID: {faturaId}");

            return await _parcelaRepository.ReadByFaturaId(faturaId);
        }

        public async Task<Parcela> SaveAsync(Parcela parcela)
        {
            if (parcela.Id == 0)
            {
                await _parcelaRepository.Create(parcela);
            }
            else
            {
                await _parcelaRepository.Update(parcela.Id, parcela);
            }
            return parcela;
        }

        public async Task DeleteAsync(long id)
        {
            await _parcelaRepository.Delete(id);
        }
    }
}