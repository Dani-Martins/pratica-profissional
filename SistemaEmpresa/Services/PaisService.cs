using SistemaEmpresa.Models;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Repositories;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using MySql.Data.MySqlClient;
using Dapper;

namespace SistemaEmpresa.Services
{
    public class PaisService
    {
        private readonly PaisRepository _paisRepository;
        private readonly string _connectionString;

        // Modificar o construtor para receber IConfiguration em vez de string diretamente
        public PaisService(PaisRepository paisRepository, IConfiguration configuration)
        {
            _paisRepository = paisRepository;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<IEnumerable<Pais>> GetAllAsync()
        {
            return await _paisRepository.ReadAll();
        }

        public async Task<Pais> GetByIdAsync(long id)  // Alterado de int para long
        {
            var pais = await _paisRepository.ReadById((int)id);
            if (pais == null)
                throw new Exception($"País não encontrado com o ID: {id}");
            return pais;
        }

        public async Task<Pais> SaveAsync(Pais pais)
        {
            if (string.IsNullOrWhiteSpace(pais.Nome))
                throw new Exception("O nome do país é obrigatório");

            if (pais.Id <= 0) // País novo sem ID válido
            {
                await _paisRepository.Create(pais);
            }
            else
            {
                var paisExistente = await _paisRepository.ReadById((int)pais.Id);
                if (paisExistente == null)
                    throw new Exception($"País não encontrado com o ID: {pais.Id}");
                    
                await _paisRepository.Update((int)pais.Id, pais);
            }
            
            return pais;
        }

        public async Task DeleteAsync(long id)  // Alterado de int para long
        {
            var pais = await _paisRepository.ReadById((int)id);
            if (pais == null)
                throw new Exception($"País não encontrado com o ID: {id}");

            await _paisRepository.Delete((int)id);
        }        public async Task<Pais> UpdateAsync(Pais pais)
        {
            var paisExistente = await _paisRepository.ReadById((int)pais.Id);
            if (paisExistente == null)
                throw new Exception($"País não encontrado com o ID: {pais.Id}");
            
            // Log para debug
            Console.WriteLine($"PaisService.UpdateAsync - Dados recebidos: Id={pais.Id}, Nome={pais.Nome}, Situacao={pais.Situacao}");
            Console.WriteLine($"PaisService.UpdateAsync - Dados existentes: Id={paisExistente.Id}, Nome={paisExistente.Nome}, Situacao={paisExistente.Situacao}");
            
            // Preservar os valores que não podem ser alterados
            pais.Id = paisExistente.Id;
            pais.DataCriacao = paisExistente.DataCriacao;
            pais.UserCriacao = paisExistente.UserCriacao;
            
            // Garantir que sempre usamos o valor da situação fornecido no input
            Console.WriteLine($"PaisService.UpdateAsync - Valor final da situação: {pais.Situacao}");
            
            await _paisRepository.Update((int)pais.Id, pais);
              // Buscar o país atualizado para garantir que os dados refletem o que está no banco
            var paisAtualizado = await _paisRepository.ReadById((int)pais.Id);
            if (paisAtualizado != null)
            {
                Console.WriteLine($"PaisService.UpdateAsync - País após atualização: Id={paisAtualizado.Id}, Nome={paisAtualizado.Nome}, Situacao={paisAtualizado.Situacao}");
                return paisAtualizado;
            }
            
            // Se não conseguir buscar, retornar o objeto original
            return pais;
        }

        public async Task<List<Pais>> GetAll()
        {
            var paises = await _paisRepository.ReadAll();
            return paises.ToList();
        }        public async Task<Pais> GetById(int id)
        {
            Console.WriteLine($"PaisService.GetById - Buscando país ID: {id}");
            
            var pais = await _paisRepository.ReadById(id);
            if (pais == null)
                throw new Exception($"País não encontrado com o ID: {id}");
                
            Console.WriteLine($"PaisService.GetById - País encontrado: ID={pais.Id}, Nome={pais.Nome}, Situacao={pais.Situacao}");
            
            return pais;
        }public async Task<Pais> Create(PaisCreateDTO dto)
        {
            var pais = new Pais
            {
                Nome = dto.Nome,
                Codigo = dto.Codigo ?? string.Empty,
                Sigla = dto.Sigla ?? string.Empty,
                Situacao = dto.Situacao,
                DataCriacao = DateTime.Now,
                UserCriacao = dto.UserCriacao ?? "SISTEMA"
            };
            
            await _paisRepository.Create(pais);
            return pais;
        }

        public async Task<Pais> Update(long id, PaisUpdateDTO dto)  // Alterado de int para long
        {
            if (id <= 0)
                throw new Exception("ID do país inválido");
                
            var paisExistente = await _paisRepository.ReadById((int)id);
            if (paisExistente == null)
                throw new Exception($"País não encontrado com o ID: {id}");
              var pais = new Pais
            {
                Id = id,
                Nome = dto.Nome,
                Sigla = dto.Sigla ?? string.Empty,
                Codigo = dto.Codigo ?? string.Empty,
                Situacao = dto.Situacao,
                DataAlteracao = DateTime.Now,
                UserAlteracao = dto.UserAlteracao ?? "SISTEMA"
            };
            
            await _paisRepository.Update((int)pais.Id, pais);
            return pais;
        }

        public async Task ExcluirForcado(long id)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            
            using var transaction = await connection.BeginTransactionAsync();
            
            try
            {
                await connection.ExecuteAsync(
                    "UPDATE estado SET pais_id = NULL WHERE pais_id = @Id",
                    new { Id = id },
                    transaction: transaction
                );
                
                await connection.ExecuteAsync(
                    "DELETE FROM pais WHERE id = @Id",
                    new { Id = id },
                    transaction: transaction
                );
                
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}