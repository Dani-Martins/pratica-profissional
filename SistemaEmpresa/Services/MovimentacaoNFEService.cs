using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class MovimentacaoNFEService
    {
        private readonly MovimentacaoNFERepository _movimentacaoRepository;
        private readonly NFERepository _nfeRepository;

        public MovimentacaoNFEService(
            MovimentacaoNFERepository movimentacaoRepository,
            NFERepository nfeRepository)
        {
            _movimentacaoRepository = movimentacaoRepository;
            _nfeRepository = nfeRepository;
        }

        public async Task<IEnumerable<MovimentacaoNFE>> GetAllAsync()
        {
            return await _movimentacaoRepository.ReadAll();
        }

        public async Task<MovimentacaoNFE> GetByIdAsync(long id)
        {
            var movimentacao = await _movimentacaoRepository.ReadById(id);
            if (movimentacao == null)
                throw new Exception($"Movimentação não encontrada com o ID: {id}");
            return movimentacao;
        }

        public async Task<IEnumerable<MovimentacaoNFE>> GetByNfeIdAsync(long nfeId)
        {
            return await _movimentacaoRepository.ReadByNfeId(nfeId);
        }

        public async Task<MovimentacaoNFE> SaveAsync(MovimentacaoNFE movimentacao)
        {
            // Verifica se a NFE existe
            var nfe = await _nfeRepository.ReadById(movimentacao.NfeId);
            if (nfe == null)
                throw new Exception($"NFE não encontrada com o ID: {movimentacao.NfeId}");

            if (movimentacao.Id == 0)
            {
                await _movimentacaoRepository.Create(movimentacao);
            }
            else
            {
                await _movimentacaoRepository.Update(movimentacao);
            }
            return movimentacao;
        }

        public async Task DeleteAsync(long id)
        {
            await _movimentacaoRepository.Delete(id);
        }
    }
}