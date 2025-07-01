using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace SistemaEmpresa.Services
{
    public class CategoriaService
    {
        private readonly CategoriaRepository _repository;

        public CategoriaService(CategoriaRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Categoria>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Categoria?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Categoria> CreateAsync(Categoria categoria)
        {
            return await _repository.CreateAsync(categoria);
        }

        public async Task UpdateAsync(Categoria categoria)
        {
            await _repository.UpdateAsync(categoria);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }

        public async Task<bool> InativarCategoriaAsync(int id)
        {
            using (var connection = _repository._context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using var command = connection.CreateCommand();
                command.CommandText = @"UPDATE categoria SET situacao = '0001-01-01 00:00:00', dataalteracao = NOW(), useratualizacao = 'SISTEMA_INATIVACAO' WHERE id = @id";
                var parameter = command.CreateParameter();
                parameter.ParameterName = "@id";
                parameter.Value = id;
                command.Parameters.Add(parameter);
                var rowsAffected = await command.ExecuteNonQueryAsync();
                return rowsAffected > 0;
            }
        }
    }
}
