package com.evolv.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TrocarSenhaRequest {

    /**
     * Senha atual. Obrigatoria na troca normal (tela Perfil). Na troca da
     * senha temporaria nao e pedida: o usuario acabou de entrar com ela.
     */
    private String senhaAtual;

    @NotBlank(message = "Informe a nova senha.")
    @Size(min = 8, message = "A nova senha precisa ter pelo menos 8 caracteres.")
    private String novaSenha;

    /** Aceite dos termos, exigido de quem ainda nao aceitou (conta criada pelo admin). */
    private Boolean aceitouTermos;

    public Boolean getAceitouTermos() { return aceitouTermos; }
    public void setAceitouTermos(Boolean aceitouTermos) { this.aceitouTermos = aceitouTermos; }
    public String getSenhaAtual() { return senhaAtual; }
    public void setSenhaAtual(String senhaAtual) { this.senhaAtual = senhaAtual; }
    public String getNovaSenha() { return novaSenha; }
    public void setNovaSenha(String novaSenha) { this.novaSenha = novaSenha; }
}
