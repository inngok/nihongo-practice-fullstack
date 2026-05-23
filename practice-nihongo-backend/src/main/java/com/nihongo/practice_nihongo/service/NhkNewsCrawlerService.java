package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.NewsArticle;
import com.nihongo.practice_nihongo.repository.NewsArticleRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;

import java.time.LocalDateTime;

@Service
public class NhkNewsCrawlerService {

    private static final Logger log = LoggerFactory.getLogger(NhkNewsCrawlerService.class);
    private static final String NHK_EASIER_URL = "https://nhkeasier.com/";
    
    @Autowired
    private NewsArticleRepository newsArticleRepository;

    @Autowired
    private AiService aiService;

    @Scheduled(cron = "0 0 0 * * ?")
    @CacheEvict(value = "newsListCache", allEntries = true)
    public void crawlDailyNhkNews() {
        log.info("Bắt đầu crawl tin tức từ nhkeasier.com...");
        try {
            Document homeDoc = Jsoup.connect(NHK_EASIER_URL).userAgent("Mozilla/5.0").get();
            org.jsoup.select.Elements articles = homeDoc.select("article");
            
            int count = 0;
            for (Element articleElement : articles) {
                if (count >= 5) break; 
                
                Element linkElement = articleElement.selectFirst("h4 a");
                if (linkElement == null) continue;
                
                String articleUrl = linkElement.attr("href");
                if (articleUrl.startsWith("/")) {
                    articleUrl = "https://nhkeasier.com" + articleUrl;
                }

                String newsId = "";
                String[] parts = articleUrl.split("/");
                if (parts.length > 2) {
                     newsId = parts[parts.length - 1];
                     if (newsId.isEmpty()) {
                         newsId = parts[parts.length - 2];
                     }
                }
                
                if (newsId.isEmpty() || newsArticleRepository.existsByNewsId(newsId)) {
                    continue;
                }
                
                Element titleElement = articleElement.selectFirst("h3");
                String title = titleElement != null ? titleElement.text().trim() : "Tin tức " + newsId;
                
                crawlAndSaveArticle(newsId, title, articleUrl);
                count++;
            }
            log.info("Hoàn tất crawl tin tức NHKEasier.");

        } catch (Exception e) {
            log.error("Lỗi khi crawl tin tức NHKEasier: ", e);
        }
    }

    private void crawlAndSaveArticle(String newsId, String fallbackTitle, String articleUrl) {
        try {
            log.info("Đang crawl bài báo NHKEasier: " + articleUrl);
            Document doc = Jsoup.connect(articleUrl).userAgent("Mozilla/5.0").get();

            Element titleElement = doc.selectFirst("article h3");
            String title = fallbackTitle;
            if (titleElement != null) {
                Element cloneTitle = titleElement.clone();
                cloneTitle.select("rt").remove();
                title = cloneTitle.text().trim();
            }

            Element contentDiv = doc.selectFirst("article");
            if (contentDiv == null) return;

            Element imgElement = contentDiv.selectFirst("img");
            String imageUrl = imgElement != null ? imgElement.attr("src") : null;
            if (imageUrl != null && imageUrl.startsWith("/")) {
                 imageUrl = "https://nhkeasier.com" + imageUrl;
            } else if (imageUrl == null) {
                 imageUrl = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop";
            }

            Element audioElement = contentDiv.selectFirst("audio");
            String audioUrl = audioElement != null ? audioElement.attr("src") : null;
            if (audioUrl != null && audioUrl.startsWith("/")) {
                 audioUrl = "https://nhkeasier.com" + audioUrl;
            }

            contentDiv.select("h3, h4, img, audio, table, nav").remove();

            StringBuilder contentWithFurigana = new StringBuilder();
            StringBuilder contentRaw = new StringBuilder();

            org.jsoup.select.Elements paragraphs = contentDiv.select("p");
            for (Element p : paragraphs) {
                if (p.text().trim().isEmpty()) continue;
                contentWithFurigana.append(p.outerHtml());
                
                Element pClone = p.clone();
                pClone.select("rt").remove();
                contentRaw.append(pClone.text()).append("\n");
            }

            NewsArticle article = new NewsArticle();
            article.setNewsId(newsId);
            article.setTitle(title);
            article.setContentWithFurigana(contentWithFurigana.toString());
            article.setContentRaw(contentRaw.toString());
            article.setSourceUrl(articleUrl);
            article.setImageUrl(imageUrl);
            article.setAudioUrl(audioUrl);
            article.setPublishedAt(LocalDateTime.now());
            
            // Tự động phân tích từ vựng bằng AI ngay khi cào về
            try {
                log.info("Đang dùng AI trích xuất từ vựng cho bài: " + newsId);
                String extractedVocab = aiService.extractVocabularyFromNews(contentRaw.toString());
                article.setExtractedVocab(extractedVocab);
            } catch (Exception aiError) {
                log.error("Lỗi khi AI trích xuất từ vựng bài: " + newsId, aiError);
            }

            newsArticleRepository.save(article);
            log.info("Lưu thành công bài báo: " + newsId);

        } catch (Exception e) {
            log.error("Lỗi khi crawl bài báo ID: " + newsId, e);
        }
    }
}
