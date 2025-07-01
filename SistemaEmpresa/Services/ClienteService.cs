using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using SistemaEmpresa.Data;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using SistemaEmpresa.Validations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaEmpresa.Services
{
    public class ClienteService
    {
        private readonly ClienteRepository _clienteRepository;
        private readonly ApplicationDbContext _context;

        public ClienteService(ClienteRepository clienteRepository, ApplicationDbContext context)
        {
            _clienteRepository = clienteRepository;
            _context = context;
        }        public async Task<List<Cliente>> GetAllAsync()
        {
            try
            {
                // Abordagem mais segura usando SQL diretamente
                var query = @"
                    SELECT 
                        c.id, 
                        COALESCE(c.tipopessoa, '') as tipopessoa,
                        COALESCE(c.nome, '') as nome, 
                        COALESCE(c.cpf, '') as cpf,
                        COALESCE(c.razaosocial, '') as razaosocial,
                        COALESCE(c.nomefantasia, '') as nomefantasia,
                        COALESCE(c.cnpj, '') as cnpj,
                        COALESCE(c.inscricaoestadual, '') as inscricaoestadual,
                        COALESCE(c.email, '') as email,
                        COALESCE(c.telefone, '') as telefone,
                        COALESCE(c.endereco, '') as endereco,
                        COALESCE(c.numero, '') as numero,
                        COALESCE(c.complemento, '') as complemento,
                        COALESCE(c.bairro, '') as bairro,
                        COALESCE(c.cep, '') as cep,
                        c.cidade_id,
                        c.ativo,
                        COALESCE(cid.nome, '') as cidade_nome,
                        COALESCE(c.apelido, '') as apelido,
                        c.isbrasileiro,
                        c.limitecredito,
                        COALESCE(c.nacionalidade, '') as nacionalidade,
                        COALESCE(c.rg, '') as rg,
                        c.datanascimento,
                        COALESCE(c.estadocivil, '') as estadocivil,
                        COALESCE(c.sexo, '') as sexo,
                        c.condicaopagamentoid,
                        c.limitecredito2,
                        COALESCE(c.observacao, '') as observacao,
                        c.datacriacao,
                        c.dataalteracao,
                        COALESCE(c.usercriacao, '') as usercriacao,                        COALESCE(c.useratualizacao, '') as useratualizacao,
                        COALESCE(cp.descricao, '') as condicao_pagamento_descricao
                    FROM cliente c
                    LEFT JOIN cidade cid ON c.cidade_id = cid.id
                    LEFT JOIN condicao_pagamento cp ON c.condicaopagamentoid = cp.id";
                      var clientes = new List<Cliente>();
                  using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = query;
                    
                    if (command.Connection != null && command.Connection.State != System.Data.ConnectionState.Open)
                        await command.Connection.OpenAsync();
                        
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {                            Console.WriteLine($"[ClienteService.GetAllAsync] Processando cliente com id={reader.GetInt64(0)}");
                            Console.WriteLine($"[ClienteService.GetAllAsync] dataCriacao (col 29): {(reader.IsDBNull(29) ? "NULL" : reader.GetDateTime(29).ToString("yyyy-MM-dd HH:mm:ss.fff"))}");
                            Console.WriteLine($"[ClienteService.GetAllAsync] dataAlteracao (col 30): {(reader.IsDBNull(30) ? "NULL" : reader.GetDateTime(30).ToString("yyyy-MM-dd HH:mm:ss.fff"))}");
                            var cliente = new Cliente
                            {
                                Id = reader.GetInt64(0),
                                TipoPessoa = reader.IsDBNull(1) ? "" : reader.GetString(1),
                                Nome = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                CPF = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                RazaoSocial = reader.IsDBNull(4) ? "" : reader.GetString(4),
                                NomeFantasia = reader.IsDBNull(5) ? "" : reader.GetString(5),
                                CNPJ = reader.IsDBNull(6) ? "" : reader.GetString(6),
                                InscricaoEstadual = reader.IsDBNull(7) ? "" : reader.GetString(7),
                                Email = reader.IsDBNull(8) ? "" : reader.GetString(8),
                                Telefone = reader.IsDBNull(9) ? "" : reader.GetString(9),
                                Endereco = reader.IsDBNull(10) ? "" : reader.GetString(10),
                                Numero = reader.IsDBNull(11) ? "" : reader.GetString(11),
                                Complemento = reader.IsDBNull(12) ? "" : reader.GetString(12),
                                Bairro = reader.IsDBNull(13) ? "" : reader.GetString(13),
                                CEP = reader.IsDBNull(14) ? "" : reader.GetString(14),
                                CidadeId = reader.IsDBNull(15) ? (long?)null : reader.GetInt64(15),
                                Ativo = reader.IsDBNull(16) ? false : reader.GetBoolean(16),
                                // Novos campos
                                Apelido = reader.IsDBNull(18) ? "" : reader.GetString(18),
                                IsBrasileiro = reader.IsDBNull(19) ? null : (bool?)reader.GetBoolean(19),
                                LimiteCredito = reader.IsDBNull(20) ? null : (decimal?)reader.GetDecimal(20),
                                Nacionalidade = reader.IsDBNull(21) ? "" : reader.GetString(21),
                                RG = reader.IsDBNull(22) ? "" : reader.GetString(22),                                DataNascimento = reader.IsDBNull(23) ? null : (DateTime?)reader.GetDateTime(23),                                EstadoCivil = reader.IsDBNull(24) ? "" : reader.GetString(24),
                                Sexo = reader.IsDBNull(25) ? "" : reader.GetString(25),
                                CondicaoPagamentoId = reader.IsDBNull(26) ? null : (long?)reader.GetInt64(26),
                                LimiteCredito2 = reader.IsDBNull(27) ? null : (decimal?)reader.GetDecimal(27),
                                Observacao = reader.IsDBNull(28) ? "" : reader.GetString(28),
                                // Garantir que a data de criação nunca seja nula, usar DateTime.Now se for
                                DataCriacao = reader.IsDBNull(29) ? DateTime.Now : reader.GetDateTime(29),
                                DataAlteracao = reader.IsDBNull(30) ? null : (DateTime?)reader.GetDateTime(30),
                                UserCriacao = reader.IsDBNull(31) ? "sistema" : reader.GetString(31),
                                UserAtualizacao = reader.IsDBNull(32) ? "" : reader.GetString(32)
                            };
                            
                            if (!reader.IsDBNull(15) && !reader.IsDBNull(17))
                            {
                                cliente.Cidade = new Cidade
                                {
                                    Id = reader.GetInt64(15), 
                                    Nome = reader.GetString(17)
                                };
                            }
                              // Adicionar CondicaoPagamento
                            if (!reader.IsDBNull(26) && !reader.IsDBNull(33))
                            {
                                cliente.CondicaoPagamento = new CondicaoPagamento
                                {
                                    Id = reader.GetInt64(26),
                                    Descricao = reader.GetString(33)
                                };
                            }
                            
                            clientes.Add(cliente);
                        }
                    }
                }
                
                return clientes;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteService.GetAllAsync] ERRO: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[ClienteService.GetAllAsync] InnerException: {ex.InnerException.Message}");
                throw;
            }
        }

        public async Task<Cliente?> GetByIdAsync(long id)
        {
            try
            {
                Console.WriteLine($"[ClienteService.GetByIdAsync] Buscando cliente ID: {id} usando Entity Framework");
                
                // Abordagem simplificada usando Entity Framework
                var cliente = await _context.Clientes
                    .AsNoTracking()
                    .Include(c => c.Cidade)
                    .FirstOrDefaultAsync(c => c.Id == id);
                    
                if (cliente == null)
                {
                    Console.WriteLine($"[ClienteService.GetByIdAsync] Cliente ID {id} não encontrado");
                    return null;
                }
                
                // Log para depuração
                Console.WriteLine($"[ClienteService.GetByIdAsync] Cliente ID {id} encontrado: TipoPessoa={cliente.TipoPessoa}");
                
                // Log adicional para clientes jurídicos
                if (cliente.TipoPessoa == "J")
                {
                    Console.WriteLine($"[ClienteService.GetByIdAsync] Detalhes do Cliente Jurídico:");
                    Console.WriteLine($"  RazaoSocial: '{cliente.RazaoSocial}'");
                    Console.WriteLine($"  NomeFantasia: '{cliente.NomeFantasia}'");
                    Console.WriteLine($"  CNPJ: '{cliente.CNPJ}'");
                }
                
                return cliente;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteService.GetByIdAsync] ERRO: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[ClienteService.GetByIdAsync] InnerException: {ex.InnerException.Message}");
                throw;
            }
        }

        // NOVO MÉTODO ADICIONADO
        public async Task<List<Cliente>> GetByNameAsync(string nome)
        {
            if (string.IsNullOrWhiteSpace(nome))
            {
                return new List<Cliente>();
            }
            
            // Buscar todos os clientes que contêm o nome (não apenas exatamente igual)
            return await _context.Clientes
                                 .Where(c => c.Nome != null && c.Nome.Contains(nome))
                                 .ToListAsync();
        }        public async Task<Cliente> CreateAsync(Cliente cliente)
        {
            // Garantir que dataCriacao seja sempre definida com data e hora atuais
            if (cliente.DataCriacao == null)
            {
                cliente.DataCriacao = DateTime.Now;
                Console.WriteLine($"[ClienteService.CreateAsync] DataCriacao estava nula, definida para {cliente.DataCriacao:yyyy-MM-dd HH:mm:ss.fff}");
            }
            
            if (string.IsNullOrEmpty(cliente.UserCriacao))
            {
                cliente.UserCriacao = "sistema";
            }
            
            // Usar o DbContext diretamente
            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return cliente;
        }        public async Task<bool> UpdateAsync(Cliente cliente)
        {
            // Usar o DbContext diretamente
            var existingCliente = await _context.Clientes.FindAsync(cliente.Id);
            if (existingCliente == null)
            {
                return false; // Cliente não encontrado
            }

            // Preservar a data de criação original
            var dataCriacaoOriginal = existingCliente.DataCriacao;
            var userCriacaoOriginal = existingCliente.UserCriacao;
            
            _context.Entry(existingCliente).CurrentValues.SetValues(cliente);
            
            // Restaurar a data de criação original - NUNCA atualizar esta data
            if (dataCriacaoOriginal != null)
            {
                existingCliente.DataCriacao = dataCriacaoOriginal;
            }
            else
            {
                // Se não tiver data de criação, usamos uma data antiga para não parecer que foi criado agora
                existingCliente.DataCriacao = DateTime.Parse("2023-01-01 00:00:00");
            }
            existingCliente.UserCriacao = string.IsNullOrEmpty(userCriacaoOriginal) ? "sistema" : userCriacaoOriginal;
            
            // Sempre atualizar a data de alteração com hora atual completa
            existingCliente.DataAlteracao = DateTime.Now;
            Console.WriteLine($"[ClienteService.UpdateAsync] DataAlteracao definida para {existingCliente.DataAlteracao:yyyy-MM-dd HH:mm:ss.fff}");
            
            if (string.IsNullOrEmpty(existingCliente.UserAtualizacao))
            {
                existingCliente.UserAtualizacao = "sistema";
            }
            
            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                // Tratar exceções de concorrência se necessário
                return false;
            }
        }
        
        public async Task SaveAsync(Cliente cliente) 
        {
            try
            {
                Console.WriteLine($"[ClienteService.SaveAsync] Iniciando salvamento do cliente ID: {cliente.Id}");
                
                var existingCliente = await _context.Clientes.FindAsync(cliente.Id);
                if (existingCliente != null)
                {
                    Console.WriteLine($"[ClienteService.SaveAsync] Cliente existente encontrado, atualizando...");
                      // Atualizar apenas os campos que existem na tabela
                    existingCliente.TipoPessoa = cliente.TipoPessoa;
                    existingCliente.Nome = cliente.Nome;
                    existingCliente.CPF = cliente.CPF;
                    existingCliente.RazaoSocial = cliente.RazaoSocial;
                    existingCliente.NomeFantasia = cliente.NomeFantasia;
                    existingCliente.CNPJ = cliente.CNPJ;
                    existingCliente.InscricaoEstadual = cliente.InscricaoEstadual;
                    existingCliente.Email = cliente.Email;
                    existingCliente.Telefone = cliente.Telefone;
                    existingCliente.Endereco = cliente.Endereco;
                    existingCliente.Numero = cliente.Numero;
                    existingCliente.Complemento = cliente.Complemento;                    
                    existingCliente.Bairro = cliente.Bairro;
                    existingCliente.CEP = cliente.CEP;
                    existingCliente.CidadeId = cliente.CidadeId;
                    existingCliente.Ativo = cliente.Ativo;
                    
                    // Novos campos
                    existingCliente.Apelido = cliente.Apelido;
                    existingCliente.IsBrasileiro = cliente.IsBrasileiro;
                    existingCliente.LimiteCredito = cliente.LimiteCredito;
                    existingCliente.Nacionalidade = cliente.Nacionalidade;
                    existingCliente.RG = cliente.RG;
                    existingCliente.DataNascimento = cliente.DataNascimento;
                    existingCliente.EstadoCivil = cliente.EstadoCivil;                    existingCliente.Sexo = cliente.Sexo;
                    existingCliente.CondicaoPagamentoId = cliente.CondicaoPagamentoId;
                    existingCliente.LimiteCredito2 = cliente.LimiteCredito2;
                    existingCliente.Observacao = cliente.Observacao;                    // Garantir que a dataCriacao seja preservada, mas dataAlteracao sempre atualizada
                    existingCliente.DataAlteracao = DateTime.Now;
                    Console.WriteLine($"[ClienteService.SaveAsync] DataAlteracao definida para {existingCliente.DataAlteracao:yyyy-MM-dd HH:mm:ss.fff}");
                    
                    // Preservar a data de criação existente, nunca atualize esse campo em registros existentes
                    // Apenas se for nulo, definimos um valor para não ficar inconsistente
                    if (existingCliente.DataCriacao == null)
                    {
                        // Se não tiver data de criação, usamos uma data antiga para não parecer que foi criado agora
                        existingCliente.DataCriacao = DateTime.Parse("2023-01-01 00:00:00");
                        Console.WriteLine($"[ClienteService.SaveAsync] DataCriacao estava nula, definida para data padrão: {existingCliente.DataCriacao:yyyy-MM-dd HH:mm:ss.fff}");
                    }
                    
                    existingCliente.UserAtualizacao = cliente.UserAtualizacao;
                }
                else
                {
                    Console.WriteLine($"[ClienteService.SaveAsync] Cliente não encontrado para atualização");
                    _context.Clientes.Add(cliente);
                }
                
                await _context.SaveChangesAsync();
                Console.WriteLine($"[ClienteService.SaveAsync] Cliente salvo com sucesso");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteService.SaveAsync] ERRO: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[ClienteService.SaveAsync] InnerException: {ex.InnerException.Message}");
                throw;
            }
        }        public async Task<bool> DeleteAsync(long id)
        {
            // Inativar cliente em vez de excluir fisicamente
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
            {
                return false; // Cliente não encontrado
            }

            // Marcar como inativo
            cliente.Ativo = false;
            cliente.DataAlteracao = DateTime.Now;
            cliente.UserAtualizacao = "sistema_inativacao";
            
            // Salvar as alterações
            await _context.SaveChangesAsync();
            return true;
        }

        // Método PatchSpecificFieldsAsync corrigido
        public async Task<Cliente> PatchSpecificFieldsAsync(long id, Dictionary<string, object> propertiesToUpdate)
        {
            Console.WriteLine($"[ClienteService.PatchSpecificFields] Iniciando atualização específica para cliente ID: {id}");
            Console.WriteLine($"[ClienteService.PatchSpecificFields] Campos a atualizar: {string.Join(", ", propertiesToUpdate.Keys)}");

            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null) throw new KeyNotFoundException($"Cliente com ID {id} não encontrado");

            var entry = _context.Entry(cliente);

            foreach (var prop in propertiesToUpdate)
            {
                var property = entry.Property(prop.Key);
                if (property != null)
                {
                    Console.WriteLine($"[ClienteService.PatchSpecificFields] Atualizando {prop.Key} de '{property.CurrentValue}' para '{prop.Value}'");
                    property.CurrentValue = prop.Value;
                    property.IsModified = true;
                }
                else
                {
                    Console.WriteLine($"[ClienteService.PatchSpecificFields] AVISO: Propriedade {prop.Key} não encontrada no modelo");
                }
            }

            try
            {
                await _context.SaveChangesAsync(); 
                Console.WriteLine("[ClienteService.PatchSpecificFields] Alterações salvas com sucesso");

                await entry.ReloadAsync();
                Console.WriteLine($"[ClienteService.PatchSpecificFields] Valores após reload: RazaoSocial='{cliente.RazaoSocial}'");

                return cliente;
            }
            catch (DbUpdateException ex) 
            {
                Console.WriteLine($"[ClienteService.PatchSpecificFields] ERRO DB: {ex.Message}");
                Console.WriteLine($"[ClienteService.PatchSpecificFields] InnerException: {ex.InnerException?.Message}");
                throw;
            }
        }

        // Método UpdateJuridicoDirectSqlAsync corrigido
        public async Task<bool> UpdateJuridicoDirectSqlAsync(long id, string? razaoSocial, string? nomeFantasia, string? inscricaoEstadual)
        {
            try
            {
                var sql = @"
                    UPDATE Clientes 
                    SET RazaoSocial = @razaoSocial, 
                        NomeFantasia = @nomeFantasia, 
                        InscricaoEstadual = @inscricaoEstadual,
                        Ativo = 1
                    WHERE Id = @id AND TipoPessoa = 'J'";                var parameters = new[]
                {
                    new MySqlParameter("@id", id),
                    new MySqlParameter("@razaoSocial", razaoSocial != null ? (object)razaoSocial : DBNull.Value),
                    new MySqlParameter("@nomeFantasia", nomeFantasia != null ? (object)nomeFantasia : DBNull.Value),
                    new MySqlParameter("@inscricaoEstadual", inscricaoEstadual != null ? (object)inscricaoEstadual : DBNull.Value)
                };

                var affectedRows = await _context.Database.ExecuteSqlRawAsync(sql, parameters);

                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteService.UpdateJuridicoDirectSql] ERRO: {ex.Message}");
                throw;
            }
        }

        // Método específico para inativar cliente via SQL direto
        public async Task<bool> InativarClienteAsync(long id)
        {
            try
            {
                Console.WriteLine($"[ClienteService.InativarClienteAsync] Iniciando inativação do cliente ID: {id}");
                
                // Usar SQL direto para garantir a inativação (semelhante ao que faz o PaisRepository)
                using (var connection = _context.Database.GetDbConnection())
                {
                    await connection.OpenAsync();
                    
                    using var command = connection.CreateCommand();
                    command.CommandText = @"
                        UPDATE cliente 
                        SET ativo = 0, 
                            dataalteracao = NOW(), 
                            useratualizacao = 'SISTEMA_INATIVACAO' 
                        WHERE id = @id";
                    
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@id";
                    parameter.Value = id;
                    command.Parameters.Add(parameter);
                    
                    var rowsAffected = await command.ExecuteNonQueryAsync();
                    
                    Console.WriteLine($"[ClienteService.InativarClienteAsync] Cliente ID {id} inativado: {rowsAffected > 0}");
                    
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClienteService.InativarClienteAsync] ERRO: {ex.Message}");
                throw;
            }
        }
    }
}