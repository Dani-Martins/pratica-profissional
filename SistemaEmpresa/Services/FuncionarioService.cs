using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;

namespace SistemaEmpresa.Services
{
    public class FuncionarioService
    {
        private readonly FuncionarioRepository _funcionarioRepository;
        private readonly CidadeRepository _cidadeRepository;
        private readonly FuncaoFuncionarioRepository _funcaoFuncionarioRepository;

        public FuncionarioService(
            FuncionarioRepository funcionarioRepository, 
            CidadeRepository cidadeRepository,
            FuncaoFuncionarioRepository funcaoFuncionarioRepository)
        {
            _funcionarioRepository = funcionarioRepository;
            _cidadeRepository = cidadeRepository;
            _funcaoFuncionarioRepository = funcaoFuncionarioRepository;
        }

        public async Task<IEnumerable<Funcionario>> GetAllAsync(bool incluirInativos = false)
        {
            return await _funcionarioRepository.ReadAll(incluirInativos);
        }

        public async Task<Funcionario> GetByIdAsync(long id)
        {
            var funcionario = await _funcionarioRepository.ReadById(id);
            if (funcionario == null)
                throw new Exception($"Funcionário não encontrado com o ID: {id}");
            return funcionario;
        }

        public async Task<IEnumerable<Funcionario>> GetByNameAsync(string nome)
        {
            return await _funcionarioRepository.ReadByName(nome);
        }

        public async Task<Funcionario> SaveAsync(Funcionario funcionario)
        {
            // Validações
            if (string.IsNullOrWhiteSpace(funcionario.Nome))
                throw new Exception("O nome do funcionário é obrigatório");

            // Validar se a cidade existe quando informada
            if (funcionario.CidadeId.HasValue)
            {
                var cidade = await _cidadeRepository.ReadById(funcionario.CidadeId.Value);
                if (cidade == null)
                    throw new Exception($"Cidade não encontrada com o ID: {funcionario.CidadeId}");
            }
            
            // Validar se a função de funcionário existe quando informada
            if (funcionario.FuncaoFuncionarioId.HasValue)
            {
                var funcao = await _funcaoFuncionarioRepository.ReadById(funcionario.FuncaoFuncionarioId.Value);
                if (funcao == null)
                    throw new Exception($"Função de funcionário não encontrada com o ID: {funcionario.FuncaoFuncionarioId}");
            }

            if (funcionario.Id == 0)
            {
                funcionario.DataCriacao = DateTime.Now;
                funcionario.UserCriacao = "SISTEMA";
                await _funcionarioRepository.Create(funcionario);
            }
            else
            {
                funcionario.DataAlteracao = DateTime.Now;
                funcionario.UserAtualizacao = "SISTEMA";
                await _funcionarioRepository.Update(funcionario.Id, funcionario);
            }
            return funcionario;
        }

        public async Task DeleteAsync(long id)
        {
            await _funcionarioRepository.Delete(id);
        }
    }
}