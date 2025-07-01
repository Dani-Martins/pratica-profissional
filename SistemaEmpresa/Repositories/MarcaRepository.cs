using SistemaEmpresa.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SistemaEmpresa.Data;

namespace SistemaEmpresa.Repositories
{
    public class MarcaRepository
    {
        protected internal readonly ApplicationDbContext _context;

        public MarcaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Marca>> GetAllAsync()
        {
            return await _context.Set<Marca>().ToListAsync();
        }

        public async Task<Marca?> GetByIdAsync(int id)
        {
            return await _context.Set<Marca>().FindAsync(id);
        }

        public async Task<Marca> CreateAsync(Marca marca)
        {
            _context.Set<Marca>().Add(marca);
            await _context.SaveChangesAsync();
            return marca;
        }

        public async Task UpdateAsync(Marca marca)
        {
            _context.Entry(marca).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var marca = await GetByIdAsync(id);
            if (marca != null)
            {
                _context.Set<Marca>().Remove(marca);
                await _context.SaveChangesAsync();
            }
        }
    }
}
