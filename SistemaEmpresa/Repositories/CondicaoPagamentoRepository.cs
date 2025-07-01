using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SistemaEmpresa.Data;
using SistemaEmpresa.Models;

namespace SistemaEmpresa.Repositories
{
    public class CondicaoPagamentoRepository
    {
        private readonly ApplicationDbContext _context;

        public CondicaoPagamentoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CondicaoPagamento>> GetAll()
        {
            return await _context.CondicoesPagamento
                .Include(c => c.Parcelas)
                .OrderBy(c => c.Descricao) // Alterado: ordena por Descricao em vez de Nome
                .ToListAsync();
        }

        public async Task<CondicaoPagamento> GetById(long id)
        {
            return await _context.CondicoesPagamento
                .Include(c => c.Parcelas)
                    .ThenInclude(p => p.FormaPagamento)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<CondicaoPagamento> Create(CondicaoPagamento condicaoPagamento)
        {
            condicaoPagamento.DataCadastro = DateTime.Now;
            condicaoPagamento.UltimaModificacao = DateTime.Now;
            
            _context.CondicoesPagamento.Add(condicaoPagamento);
            await _context.SaveChangesAsync();
            return condicaoPagamento;
        }

        public async Task<CondicaoPagamento> Update(CondicaoPagamento condicaoPagamento)
        {
            var existingEntity = await _context.CondicoesPagamento.FindAsync(condicaoPagamento.Id);
            if (existingEntity == null)
                return null;

            _context.Entry(existingEntity).CurrentValues.SetValues(condicaoPagamento);
            existingEntity.UltimaModificacao = DateTime.Now;
            await _context.SaveChangesAsync();
            return existingEntity;
        }

        public async Task<bool> Delete(long id)
        {
            var condicaoPagamento = await _context.CondicoesPagamento.FindAsync(id);
            if (condicaoPagamento == null)
                return false;

            _context.CondicoesPagamento.Remove(condicaoPagamento);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> Exists(string codigo, long? idExcluir = null)
        {
            return await _context.CondicoesPagamento
                .AnyAsync(c => c.Codigo == codigo && 
                         (idExcluir == null || c.Id != idExcluir));
        }
    }
}
