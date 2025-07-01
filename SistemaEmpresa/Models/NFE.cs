using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("nfe")]
    public class NFE
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required(ErrorMessage = "O número da NFE é obrigatório")]
        [Column("numero")]
        [StringLength(50, MinimumLength = 9, ErrorMessage = "O número da NFE deve ter 9 dígitos")]
        public string Numero { get; set; } = string.Empty;

        [Required(ErrorMessage = "Série é obrigatória")]
        [Column("serie")]
        [StringLength(3, ErrorMessage = "Série deve ter no máximo 3 caracteres")]
        public string Serie { get; set; } = string.Empty;

        [Column("chave_acesso")]
        [StringLength(44, ErrorMessage = "Chave de acesso deve ter 44 caracteres")]
        [RegularExpression(@"^\d{44}$", ErrorMessage = "Chave de acesso deve conter 44 dígitos numéricos")]
        public string? ChaveAcesso { get; set; }

        [Required(ErrorMessage = "A data de emissão é obrigatória")]
        [Column("data_emissao")]
        public DateTime DataEmissao { get; set; }

        [Column("cliente_id")]
        public long? ClienteId { get; set; }

        [Required(ErrorMessage = "O valor total é obrigatório")]
        [Column("valor_total", TypeName = "decimal(15,2)")]
        [Range(0.01, double.MaxValue, ErrorMessage = "O valor total deve ser maior que zero")]
        public decimal ValorTotal { get; set; }

        [Column("forma_pagamento_id")]
        public long? FormaPagamentoId { get; set; }

        [Column("condicao_pagamento_id")]
        public long? CondicaoPagamentoId { get; set; }

        // [Column("observacoes")]
        // [StringLength(1000, ErrorMessage = "Observações deve ter no máximo 1000 caracteres")]
        // public string? Observacoes { get; set; }

        [Column("emitente_id")]
        public long? EmitenteId { get; set; }

        [Column("destinatario_id")]
        public long? DestinatarioId { get; set; }

        [Column("transportadora_id")]
        public long? TransportadoraId { get; set; }

        [Column("veiculo_id")]
        public long? VeiculoId { get; set; }

        [Required(ErrorMessage = "Modalidade é obrigatória")]
        [Column("modalidade_id")]
        public long ModalidadeId { get; set; }

        [Required(ErrorMessage = "Status é obrigatório")]
        [Column("status")]
        [StringLength(20, ErrorMessage = "Status deve ter no máximo 20 caracteres")]
        public string Status { get; set; } = string.Empty;

        [Column("cancelada")]
        public bool Cancelada { get; set; } = false;

        [ForeignKey("ClienteId")]
        public virtual Cliente? Cliente { get; set; }

        [ForeignKey("FormaPagamentoId")]
        public virtual FormaPagamento? FormaPagamento { get; set; }

        [ForeignKey("CondicaoPagamentoId")]
        public virtual CondicaoPagamento? CondicaoPagamento { get; set; }

        [ForeignKey("TransportadoraId")]
        public virtual Transportadora? Transportadora { get; set; }

        [ForeignKey("VeiculoId")]
        public virtual Veiculo? Veiculo { get; set; }

        [ForeignKey("ModalidadeId")]
        public virtual ModalidadeNFE? Modalidade { get; set; }

        public virtual ICollection<ItemNFE>? Itens { get; set; }
        public virtual ICollection<MovimentacaoNFE>? Movimentacoes { get; set; }
        public virtual ICollection<Fatura>? Faturas { get; set; }

        [NotMapped] // Não mapeado para o banco de dados
        public decimal ValorProdutos 
        { 
            get => Itens?.Sum(i => i.ValorTotal) ?? 0; 
            set { /* Não faz nada, é calculado */ } 
        }

        [NotMapped]
        public decimal ValorFrete { get; set; } = 0;

        public void CalcularValorTotal()
        {
            if (Itens == null || !Itens.Any())
            {
                ValorTotal = 0;
                return;
            }

            ValorTotal = Itens.Sum(i => i.ValorTotal);
        }
    }
}
