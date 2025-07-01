using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class ItemNFEService
    {
        private readonly ItemNFERepository _itemNFERepository;
        private readonly NFERepository _nfeRepository;
        private readonly ProdutoRepository _produtoRepository;

        public ItemNFEService(
            ItemNFERepository itemNFERepository,
            NFERepository nfeRepository,
            ProdutoRepository produtoRepository)
        {
            _itemNFERepository = itemNFERepository;
            _nfeRepository = nfeRepository;
            _produtoRepository = produtoRepository;
        }

        public async Task<IEnumerable<ItemNFE>> GetAllAsync()
        {
            return await _itemNFERepository.ReadAll();
        }

        public async Task<ItemNFE> GetByIdAsync(long id)
        {
            var item = await _itemNFERepository.ReadById(id);
            if (item == null)
                throw new Exception($"Item NFE não encontrado com o ID: {id}");
            return item;
        }

        public async Task<IEnumerable<ItemNFE>> GetByNfeIdAsync(long nfeId)
        {
            var nfe = await _nfeRepository.ReadById(nfeId);
            if (nfe == null)
                throw new Exception($"NFE não encontrada com o ID: {nfeId}");

            return await _itemNFERepository.ReadByNfeId(nfeId);
        }

        public async Task<ItemNFE> SaveAsync(ItemNFE item)
        {
            // Validar NFE
            var nfe = await _nfeRepository.ReadById(item.NfeId);
            if (nfe == null)
                throw new Exception($"NFE não encontrada com o ID: {item.NfeId}");

            // Validar Produto
            var produto = await _produtoRepository.ReadById(item.ProdutoId);
            if (produto == null)
                throw new Exception($"Produto não encontrado com o ID: {item.ProdutoId}");

            if (item.Id == 0)
            {
                await _itemNFERepository.Create(item);
            }
            else
            {
                await _itemNFERepository.Update(item.Id, item);
            }
            return item;
        }

        public async Task DeleteAsync(long id)
        {
            await _itemNFERepository.Delete(id);
        }
    }
}