using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace SistemaEmpresa.Services
{
    public class UnidadeMedidaService
    {
        private readonly UnidadeMedidaRepository _repository;

        public UnidadeMedidaService(UnidadeMedidaRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<UnidadeMedida>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<UnidadeMedida?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<UnidadeMedida> CreateAsync(UnidadeMedida unidade)
        {
            return await _repository.CreateAsync(unidade);
        }

        public async Task UpdateAsync(UnidadeMedida unidade)
        {
            await _repository.UpdateAsync(unidade);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }

        public async Task<bool> InativarUnidadeMedidaAsync(int id)
        {
            // Inativa diretamente no banco, igual ClienteService
            using (var connection = _repository._context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using var command = connection.CreateCommand();
                command.CommandText = @"UPDATE unidademedidas SET situacao = '0001-01-01 00:00:00', dataalteracao = NOW(), useratualizacao = 'SISTEMA_INATIVACAO' WHERE id = @id";
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
