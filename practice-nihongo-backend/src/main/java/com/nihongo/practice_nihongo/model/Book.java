package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String japaneseTitle;

    private String levelLabel;

    private String num; 

    private String type; 

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Grammar> grammars;

    public Book() {}

    public Book(Long id, String title, String japaneseTitle, String levelLabel, String num, String type, List<Grammar> grammars) {
        this.id = id;
        this.title = title;
        this.japaneseTitle = japaneseTitle;
        this.levelLabel = levelLabel;
        this.num = num;
        this.type = type;
        this.grammars = grammars;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getJapaneseTitle() { return japaneseTitle; }
    public void setJapaneseTitle(String japaneseTitle) { this.japaneseTitle = japaneseTitle; }
    public String getLevelLabel() { return levelLabel; }
    public void setLevelLabel(String levelLabel) { this.levelLabel = levelLabel; }
    public String getNum() { return num; }
    public void setNum(String num) { this.num = num; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public List<Grammar> getGrammars() { return grammars; }
    public void setGrammars(List<Grammar> grammars) { this.grammars = grammars; }

    public static class BookBuilder {
        private Long id;
        private String title;
        private String japaneseTitle;
        private String levelLabel;
        private String num;
        private String type;
        private List<Grammar> grammars;

        public BookBuilder id(Long id) { this.id = id; return this; }
        public BookBuilder title(String title) { this.title = title; return this; }
        public BookBuilder japaneseTitle(String japaneseTitle) { this.japaneseTitle = japaneseTitle; return this; }
        public BookBuilder levelLabel(String levelLabel) { this.levelLabel = levelLabel; return this; }
        public BookBuilder num(String num) { this.num = num; return this; }
        public BookBuilder type(String type) { this.type = type; return this; }
        public BookBuilder grammars(List<Grammar> grammars) { this.grammars = grammars; return this; }

        public Book build() {
            return new Book(id, title, japaneseTitle, levelLabel, num, type, grammars);
        }
    }

    public static BookBuilder builder() {
        return new BookBuilder();
    }
}
