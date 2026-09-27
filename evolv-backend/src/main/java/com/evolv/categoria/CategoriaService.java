package com.evolv.categoria;

import com.evolv.auditoria.AuditoriaService;
import com.evolv.categoria.dto.CategoriaRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CategoriaService {

    private final CategoriaRepository repository;
    private final AuditoriaService auditoriaService;

    public CategoriaService(CategoriaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    public List<Categoria> listarTodas() {
        return repository.findAll();
    }

    public Categoria buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Categoria não encontrada."));
    }

    public Categoria criar(CategoriaRequest request) {
        if (repository.existsByNomeIgnoreCase(request.getNome())) {
            throw new ResponseStatusException(CONFLICT, "Já existe uma categoria com esse nome.");
        }
        Categoria categoria = new Categoria(request.getNome(), request.getDescricao());
        categoria = repository.save(categoria);

        auditoriaService.registrar("CRIAR", "Categoria", categoria.getId(), categoria.getNome());
        return categoria;
    }

    public Categoria atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscarPorId(id);

        repository.findByNomeIgnoreCase(request.getNome())
                .filter(outra -> !outra.getId().equals(id))
                .ifPresent(outra -> {
                    throw new ResponseStatusException(CONFLICT, "Já existe uma categoria com esse nome.");
                });

        categoria.setNome(request.getNome());
        categoria.setDescricao(request.getDescricao());
        categoria = repository.save(categoria);

        auditoriaService.registrar("ATUALIZAR", "Categoria", categoria.getId(), categoria.getNome());
        return categoria;
    }

    public void excluir(Long id) {
        Categoria categoria = buscarPorId(id);
        try {
            repository.delete(categoria);
            repository.flush();
            auditoriaService.registrar("EXCLUIR", "Categoria", id, categoria.getNome());
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(CONFLICT,
                    "Não é possível excluir esta categoria: existem quizzes vinculados a ela. " +
                    "Exclua ou mova esses quizzes primeiro.");
        }
    }
}
