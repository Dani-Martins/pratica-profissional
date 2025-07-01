using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class ModalidadeNFEService
    {
        private readonly ModalidadeNFERepository _modalidadeRepository;

        public ModalidadeNFEService(ModalidadeNFERepository modalidadeRepository)
        {
            _modalidadeRepository = modalidadeRepository;
        }

        public async Task<IEnumerable<ModalidadeNFE>> GetAllAsync()
        {
            return await _modalidadeRepository.ReadAll();
        }

        public async Task<ModalidadeNFE> GetByIdAsync(long id)
        {
            var modalidade = await _modalidadeRepository.ReadById(id);
            if (modalidade == null)
                throw new Exception($"Modalidade NFE não encontrada com o ID: {id}");
            return modalidade;
        }

        public async Task<ModalidadeNFE> SaveAsync(ModalidadeNFE modalidade)
        {
            if (modalidade.Id == 0)
            {
                await _modalidadeRepository.Create(modalidade);
            }
            else
            {
                await _modalidadeRepository.Update(modalidade.Id, modalidade);
            }
            return modalidade;
        }

        public async Task DeleteAsync(long id)
        {
            await _modalidadeRepository.Delete(id);
        }
    }
}