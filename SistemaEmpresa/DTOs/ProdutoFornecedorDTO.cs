using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class ProdutoFornecedorDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "Produto é obrigatório")]
        public long ProdutoId { get; set; }

        [Required(ErrorMessage = "Fornecedor é obrigatório")]
        public long FornecedorId { get; set; }

        [StringLength(50, ErrorMessage = "Código do produto deve ter no máximo 50 caracteres")]
        public string? CodigoProd { get; set; }

        [Range(0, 999999.99, ErrorMessage = "Custo deve estar entre 0 e 999.999,99")]
        public decimal? Custo { get; set; }

        public bool Ativo { get; set; }

        public ProdutoDTO? Produto { get; set; }
        public FornecedorDTO? Fornecedor { get; set; }
    }

    public class CreateProdutoFornecedorDTO
    {
        [Required(ErrorMessage = "Produto é obrigatório")]
        public long ProdutoId { get; set; }

        [Required(ErrorMessage = "Fornecedor é obrigatório")]
        public long FornecedorId { get; set; }

        [StringLength(50, ErrorMessage = "Código do produto deve ter no máximo 50 caracteres")]
        public string? CodigoProd { get; set; }

        [Range(0, 999999.99, ErrorMessage = "Custo deve estar entre 0 e 999.999,99")]
        public decimal? Custo { get; set; }
    }

    public class UpdateProdutoFornecedorDTO : CreateProdutoFornecedorDTO
    {
        public bool Ativo { get; set; }
    }
}