using SistemaEmpresa.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SistemaEmpresa.Data;

namespace SistemaEmpresa.Repositories
{
    public class UnidadeMedidaRepository
    {
        protected internal readonly ApplicationDbContext _context;

        public UnidadeMedidaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<UnidadeMedida>> GetAllAsync()
        {
            return await _context.Set<UnidadeMedida>().ToListAsync();
        }

        public async Task<UnidadeMedida?> GetByIdAsync(int id)
        {
            return await _context.Set<UnidadeMedida>().FindAsync(id);
        }

        public async Task<UnidadeMedida> CreateAsync(UnidadeMedida unidade)
        {
            _context.Set<UnidadeMedida>().Add(unidade);
            await _context.SaveChangesAsync();
            return unidade;
        }

        public async Task UpdateAsync(UnidadeMedida unidade)
        {
            _context.Entry(unidade).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var unidade = await GetByIdAsync(id);
            if (unidade != null)
            {
                _context.Set<UnidadeMedida>().Remove(unidade);
                await _context.SaveChangesAsync();
            }
        }
    }
}
