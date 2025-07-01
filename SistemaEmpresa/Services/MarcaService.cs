using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace SistemaEmpresa.Services
{
    public class MarcaService
    {
        private readonly MarcaRepository _repository;

        public MarcaService(MarcaRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Marca>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Marca?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Marca> CreateAsync(Marca marca)
        {
            return await _repository.CreateAsync(marca);
        }

        public async Task UpdateAsync(Marca marca)
        {
            await _repository.UpdateAsync(marca);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }

        public async Task<bool> InativarMarcaAsync(int id)
        {
            using (var connection = _repository._context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using var command = connection.CreateCommand();
                command.CommandText = @"UPDATE marcas SET situacao = '0001-01-01 00:00:00', dataalteracao = NOW(), useratualizacao = 'SISTEMA_INATIVACAO' WHERE id = @id";
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
