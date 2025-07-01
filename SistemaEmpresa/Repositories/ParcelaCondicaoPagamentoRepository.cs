using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SistemaEmpresa.Data;
using SistemaEmpresa.Models;

namespace SistemaEmpresa.Repositories
{
    public class ParcelaCondicaoPagamentoRepository
    {
        private readonly ApplicationDbContext _context;

        public ParcelaCondicaoPagamentoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ParcelaCondicaoPagamento>> GetByCondicaoPagamentoId(long condicaoPagamentoId)
        {
            return await _context.ParcelasCondicaoPagamento
                .Include(p => p.FormaPagamento)
                .Where(p => p.CondicaoPagamentoId == condicaoPagamentoId)
                .OrderBy(p => p.Numero)
                .ToListAsync();
        }
        
        public async Task<ParcelaCondicaoPagamento> GetById(long id)
        {
            return await _context.ParcelasCondicaoPagamento
                .Include(p => p.FormaPagamento)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<ParcelaCondicaoPagamento> Create(ParcelaCondicaoPagamento parcela)
        {
            parcela.DataCadastro = DateTime.Now;
            parcela.UltimaModificacao = DateTime.Now;
            
            _context.ParcelasCondicaoPagamento.Add(parcela);
            await _context.SaveChangesAsync();
            return parcela;
        }

        public async Task<ParcelaCondicaoPagamento> Update(ParcelaCondicaoPagamento parcela)
        {
            var existingParcela = await _context.ParcelasCondicaoPagamento
                .FirstOrDefaultAsync(p => p.Id == parcela.Id);
                
            if (existingParcela == null)
                return null;
            
            existingParcela.Numero = parcela.Numero;
            existingParcela.Dias = parcela.Dias;
            existingParcela.Percentual = parcela.Percentual;
            existingParcela.FormaPagamentoId = parcela.FormaPagamentoId;
            existingParcela.UltimaModificacao = DateTime.Now;
            
            await _context.SaveChangesAsync();
            return existingParcela;
        }

        public async Task<bool> Delete(long id)
        {
            var parcela = await _context.ParcelasCondicaoPagamento.FindAsync(id);
            if (parcela == null)
                return false;
                
            _context.ParcelasCondicaoPagamento.Remove(parcela);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> DeleteByCondicaoPagamentoId(long condicaoPagamentoId)
        {
            var parcelas = await _context.ParcelasCondicaoPagamento
                .Where(p => p.CondicaoPagamentoId == condicaoPagamentoId)
                .ToListAsync();
                
            if (parcelas.Count == 0)
                return false;
                
            _context.ParcelasCondicaoPagamento.RemoveRange(parcelas);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}