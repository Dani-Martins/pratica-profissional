using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SistemaEmpresa.Models;
using SistemaEmpresa.Data;

namespace SistemaEmpresa.Repositories
{
    public class FormaPagamentoRepository
    {
        private readonly ApplicationDbContext _context;

        public FormaPagamentoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FormaPagamento>> GetAll()
        {
            return await _context.FormaPagamento
                .OrderBy(fp => fp.Descricao)
                .ToListAsync();
        }

        // Método renomeado de GetById para ReadById para manter consistência
        public async Task<FormaPagamento> ReadById(long id)
        {
            return await _context.FormaPagamento
                .FirstOrDefaultAsync(fp => fp.Id == id);
        }

        // Manter o GetById como alias para compatibilidade
        public async Task<FormaPagamento> GetById(long id)
        {
            return await ReadById(id);
        }        public async Task<FormaPagamento> Create(FormaPagamento formaPagamento)
        {
            try 
            {
                Console.WriteLine($"REPOSITORY - Iniciando processo de criação de forma de pagamento");
                
                // Garantir valores necessários
                if (string.IsNullOrEmpty(formaPagamento.Descricao))
                {
                    Console.WriteLine("REPOSITORY - Descrição está vazia, definindo valor padrão");
                    formaPagamento.Descricao = "Nova Forma de Pagamento";
                }
                  // Definir valores padrão explicitamente
                formaPagamento.DataCriacao = DateTime.Now;
                formaPagamento.UserCriacao = !string.IsNullOrWhiteSpace(formaPagamento.UserCriacao) ? formaPagamento.UserCriacao : "Sistema";
                formaPagamento.Situacao = 1; // Garantir que sempre seja ativo (1)
                
                // Log dos valores finais que serão enviados ao banco
                Console.WriteLine($"REPOSITORY - Valores da FormaPagamento:");
                Console.WriteLine($"  Descricao: '{formaPagamento.Descricao}'");
                Console.WriteLine($"  Situacao: {formaPagamento.Situacao}");
                Console.WriteLine($"  DataCriacao: {formaPagamento.DataCriacao}");
                Console.WriteLine($"  UserCriacao: '{formaPagamento.UserCriacao}'");
                
                // Usar o método mais simples do EF Core
                _context.FormaPagamento.Add(formaPagamento);
                
                // Imprimir o SQL gerado (para diagnóstico)
                try 
                {
                    var entry = _context.Entry(formaPagamento);
                    Console.WriteLine($"REPOSITORY - Estado da entidade: {entry.State}");
                      // Obter o SQL que seria executado (isso não é suportado diretamente, mas ajuda no diagnóstico)
                    var entityType = _context.Model.FindEntityType(typeof(FormaPagamento));
                    if (entityType != null) 
                    {
                        Console.WriteLine($"REPOSITORY - Entidade mapeada para tabela: {entityType.GetTableName()}");
                        
                        foreach (var property in entityType.GetProperties())
                        {
                            Console.WriteLine($"  Propriedade: {property.Name} -> Coluna: {property.GetColumnName()}");
                        }
                    }
                    
                    // Tentar salvar
                    await _context.SaveChangesAsync();
                    
                    Console.WriteLine($"REPOSITORY - Forma de pagamento criada com sucesso, ID: {formaPagamento.Id}");
                }
                catch (Exception saveEx)
                {
                    Console.WriteLine($"REPOSITORY - ERRO ao salvar no banco: {saveEx.Message}");
                    if (saveEx.InnerException != null)
                    {
                        Console.WriteLine($"REPOSITORY - Inner exception do SaveChanges: {saveEx.InnerException.Message}");
                        Console.WriteLine($"REPOSITORY - Inner stack trace: {saveEx.InnerException.StackTrace}");
                    }
                    
                    // Tentar uma abordagem diferente - SQL direto (não recomendado, mas útil para diagnóstico)
                    try 
                    {
                        Console.WriteLine("REPOSITORY - Tentando inserção SQL direta como último recurso");
                        
                        // Não use isso em produção, apenas para diagnóstico
                        var sql = $@"INSERT INTO forma_pagamento (descricao, situacao, data_criacao, user_criacao) 
                                   VALUES ('{formaPagamento.Descricao.Replace("'", "''")}', 1, NOW(), 'Sistema')";
                          Console.WriteLine($"REPOSITORY - SQL gerado: {sql}");
                        
                        // Não execute isso aqui, apenas use o log para diagnosticar o problema
                        throw; // Lançar uma nova exceção para não perder o stack trace
                    }
                    catch 
                    {
                        throw; // Relançar para preservar o stack trace
                    }
                }
                
                return formaPagamento;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"REPOSITORY - ERRO CRÍTICO na inserção: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"REPOSITORY - Inner exception: {ex.InnerException.Message}");
                    Console.WriteLine($"REPOSITORY - Inner stack trace: {ex.InnerException.StackTrace}");
                }
                
                throw; // Relançar a exceção para tratamento no serviço
            }
        }    public async Task<FormaPagamento?> Update(long id, FormaPagamento formaPagamento)
        {
            var existing = await _context.FormaPagamento.FindAsync(id);
            
            if (existing == null)
                return null;
                
            existing.Descricao = formaPagamento.Descricao;
            existing.Situacao = formaPagamento.Situacao;
            existing.DataAlteracao = DateTime.Now;
            existing.UserAtualizacao = formaPagamento.UserAtualizacao ?? "Sistema";
            
            // Garantir que salvamos com a situação válida
            Console.WriteLine($"REPOSITORY - Update: Situacao = {existing.Situacao}");
                
            await _context.SaveChangesAsync();
            return existing;
        }public async Task<bool> Delete(long id)
        {
            var formaPagamento = await _context.FormaPagamento.FindAsync(id);
            
            if (formaPagamento == null)
                return false;
            
            // Em vez de remover, apenas inativa o registro
            formaPagamento.Situacao = 0; // 0 = inativo
            formaPagamento.DataAlteracao = DateTime.Now;
            formaPagamento.UserAtualizacao = "Sistema";
            
            await _context.SaveChangesAsync();
            return true;
        }// Adicione este método à classe FormaPagamentoRepository
        public async Task<FormaPagamento?> GetByDescricao(string descricao)
        {
            return await _context.FormaPagamento
                .FirstOrDefaultAsync(fp => fp.Descricao.ToLower() == descricao.ToLower());
        }
    }
}
