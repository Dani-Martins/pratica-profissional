using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class TranspItemService
    {
        private readonly TranspItemRepository _transpItemRepository;

        public TranspItemService(TranspItemRepository transpItemRepository)
        {
            _transpItemRepository = transpItemRepository;
        }

        public async Task<IEnumerable<TranspItem>> GetAllAsync()
        {
            return await _transpItemRepository.ReadAll();
        }

        public async Task<TranspItem> GetByIdAsync(long id)
        {
            var transpItem = await _transpItemRepository.ReadById(id);
            if (transpItem == null)
                throw new Exception($"Item de transporte não encontrado com o ID: {id}");
            return transpItem;
        }

        public async Task<TranspItem> SaveAsync(TranspItem transpItem)
        {
            if (transpItem.Id == 0)
            {
                await _transpItemRepository.Create(transpItem);
            }
            else
            {
                await _transpItemRepository.Update(transpItem.Id, transpItem);
            }
            return transpItem;
        }

        public async Task DeleteAsync(long id)
        {
            await _transpItemRepository.Delete(id);
        }
    }
}