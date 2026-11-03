package com.evolv.usuario;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Usuario do sistema. Implementa UserDetails para se integrar diretamente
 * com o Spring Security (RF - Login e controle de acesso).
 *
 * O campo aceitouTermos/dataAceiteTermos existe para atender a LGPD: o
 * cadastro so e permitido se o usuario aceitar os termos, e guardamos
 * quando esse aceite aconteceu.
 */
@Entity
@Table(name = "usuario")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Perfil perfil;

    @Column(nullable = false)
    private boolean aceitouTermos = false;

    private LocalDateTime dataAceiteTermos;

    /**
     * RF09 - Gamificacao: XP acumulado pelo usuario. O nivel nao e
     * armazenado - ele e sempre calculado a partir do XP (ver
     * GamificacaoService.calcularNivel), assim nunca fica inconsistente.
     */
    @Column(nullable = false)
    private int xpTotal = 0;

    /**
     * RF13 - Administracao de usuarios: o administrador pode desativar uma
     * conta em vez de exclui-la, preservando o historico de tentativas.
     * Conta desativada nao consegue fazer login.
     */
    @Column(nullable = false)
    private boolean ativo = true;

    /**
     * Senha temporaria criada pelo administrador (ex.: usuario esqueceu a
     * senha). Enquanto for true, o usuario so consegue trocar a senha; depois
     * de senhaTemporariaExpiraEm, a senha temporaria deixa de funcionar.
     */
    @Column(nullable = false)
    private boolean senhaTemporaria = false;

    private LocalDateTime senhaTemporariaExpiraEm;

    /** Momento da ultima troca de senha: tokens emitidos antes disso deixam de valer. */
    private LocalDateTime senhaAlteradaEm;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Usuario() {
    }

    public Usuario(String nome, String email, String senhaHash, Perfil perfil) {
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.perfil = perfil;
    }

    // ---- UserDetails ----

    @Override
    public List<GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + perfil.name()));
    }

    @Override
    public String getPassword() {
        return senhaHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }

    // ---- Getters/Setters ----

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public Perfil getPerfil() {
        return perfil;
    }

    public void setPerfil(Perfil perfil) {
        this.perfil = perfil;
    }

    public boolean isAceitouTermos() {
        return aceitouTermos;
    }

    public void setAceitouTermos(boolean aceitouTermos) {
        this.aceitouTermos = aceitouTermos;
    }

    public LocalDateTime getDataAceiteTermos() {
        return dataAceiteTermos;
    }

    public void setDataAceiteTermos(LocalDateTime dataAceiteTermos) {
        this.dataAceiteTermos = dataAceiteTermos;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public int getXpTotal() {
        return xpTotal;
    }

    public void setXpTotal(int xpTotal) {
        this.xpTotal = xpTotal;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public boolean isSenhaTemporaria() {
        return senhaTemporaria;
    }

    public void setSenhaTemporaria(boolean senhaTemporaria) {
        this.senhaTemporaria = senhaTemporaria;
    }

    public LocalDateTime getSenhaTemporariaExpiraEm() {
        return senhaTemporariaExpiraEm;
    }

    public void setSenhaTemporariaExpiraEm(LocalDateTime senhaTemporariaExpiraEm) {
        this.senhaTemporariaExpiraEm = senhaTemporariaExpiraEm;
    }

    public LocalDateTime getSenhaAlteradaEm() {
        return senhaAlteradaEm;
    }

    public void setSenhaAlteradaEm(LocalDateTime senhaAlteradaEm) {
        this.senhaAlteradaEm = senhaAlteradaEm;
    }

    /** Senha temporaria vencida: nao pode mais ser usada. */
    public boolean senhaTemporariaExpirada() {
        return senhaTemporaria && senhaTemporariaExpiraEm != null && LocalDateTime.now().isAfter(senhaTemporariaExpiraEm);
    }
}
