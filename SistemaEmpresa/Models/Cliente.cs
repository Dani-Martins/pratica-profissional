using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SistemaEmpresa.Models
{
    [Table("cliente")]
    public class Cliente
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("tipopessoa")]
        [StringLength(1)]
        public string? TipoPessoa { get; set; } // F = Física, J = Jurídica

        [Column("nome")]
        [StringLength(100)]
        public string? Nome { get; set; }

        [Column("cpf")]
        [StringLength(14)]
        public string? CPF { get; set; }

        [Column("razaosocial")]
        [StringLength(100)]
        public string? RazaoSocial { get; set; }

        [Column("nomefantasia")]
        [StringLength(100)]
        public string? NomeFantasia { get; set; }

        [Column("cnpj")]
        [StringLength(18)]
        public string? CNPJ { get; set; }

        [Column("inscricaoestadual")]
        [StringLength(20)]
        public string? InscricaoEstadual { get; set; }

        [Column("email")]
        [StringLength(100)]
        public string? Email { get; set; }

        [Column("telefone")]
        [StringLength(20)]
        public string? Telefone { get; set; }

        [Column("endereco")]
        [StringLength(100)]
        public string? Endereco { get; set; }

        [Column("numero")]
        [StringLength(10)]
        public string? Numero { get; set; }

        [Column("complemento")]
        [StringLength(50)]
        public string? Complemento { get; set; }

        [Column("bairro")]
        [StringLength(50)]
        public string? Bairro { get; set; }

        [Column("cep")]
        [StringLength(9)]
        public string? CEP { get; set; }

        [Column("cidade_id")]
        public long? CidadeId { get; set; }
        
        [ForeignKey("CidadeId")]
        public virtual Cidade? Cidade { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; }

        // Novos campos adicionados
        [Column("apelido")]
        [StringLength(60)]
        public string? Apelido { get; set; }

        [Column("isbrasileiro")]
        public bool? IsBrasileiro { get; set; }

        [Column("limitecredito")]
        [Precision(10, 2)]
        public decimal? LimiteCredito { get; set; }

        [Column("nacionalidade")]
        [StringLength(255)]
        public string? Nacionalidade { get; set; }

        [Column("rg")]
        [StringLength(14)]
        public string? RG { get; set; }

        [Column("datanascimento")]
        public DateTime? DataNascimento { get; set; }

        [Column("estadocivil")]
        [StringLength(255)]
        public string? EstadoCivil { get; set; }        [Column("sexo")]
        [StringLength(1)]
        public string? Sexo { get; set; }

        [Column("condicaopagamentoid")]
        public long? CondicaoPagamentoId { get; set; }

        [ForeignKey("CondicaoPagamentoId")]
        public virtual CondicaoPagamento? CondicaoPagamento { get; set; }

        [Column("limitecredito2")]
        [Precision(10, 2)]
        public decimal? LimiteCredito2 { get; set; }

        [Column("observacao")]
        [StringLength(255)]
        public string? Observacao { get; set; }

        [Column("datacriacao")]
        public DateTime? DataCriacao { get; set; }

        [Column("dataalteracao")]
        public DateTime? DataAlteracao { get; set; }

        [Column("usercriacao")]
        public string? UserCriacao { get; set; }

        [Column("useratualizacao")]
        public string? UserAtualizacao { get; set; }
    }
}
