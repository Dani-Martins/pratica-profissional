using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.Services
{
    public class NFEService
    {
        private readonly NFERepository _nfeRepository;

        public NFEService(NFERepository nfeRepository)
        {
            _nfeRepository = nfeRepository;
        }

        public async Task<IEnumerable<NFE>> GetAllAsync()
        {
            return await _nfeRepository.ReadAll();
        }

        public async Task<NFE> GetByIdAsync(long id)
        {
            var nfe = await _nfeRepository.ReadById(id);
            if (nfe == null)
                throw new Exception($"NFE não encontrada com o ID: {id}");
            return nfe;
        }

        public async Task<NFE> SaveAsync(NFE nfe)
        {
            // Validar número único
            var existente = await _nfeRepository.ReadByNumero(nfe.Numero);
            if (existente != null && existente.Id != nfe.Id)
                throw new ValidationException("Já existe uma NFE com este número");

            // Validar data
            if (nfe.DataEmissao > DateTime.Now)
                throw new ValidationException("A data de emissão não pode ser futura");

            // Validar valor
            if (nfe.ValorTotal <= 0)
                throw new ValidationException("O valor total deve ser maior que zero");

            if (nfe.Id == 0)
            {
                await _nfeRepository.Create(nfe);
            }
            else
            {
                await _nfeRepository.Update(nfe.Id, nfe);
            }
            return nfe;
        }

        public async Task DeleteAsync(long id)
        {
            await _nfeRepository.Delete(id);
        }
    }
}