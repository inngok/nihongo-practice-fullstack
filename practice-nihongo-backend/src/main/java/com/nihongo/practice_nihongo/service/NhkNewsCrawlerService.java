package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.NewsArticle;
import com.nihongo.practice_nihongo.repository.NewsArticleRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
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

    @Autowired
    private NotificationService notificationService;

    @Scheduled(cron = "0 0 0 * * ?")
    @CacheEvict(value = "newsListCache", allEntries = true)
    public void crawlDailyNhkNews() {
        log.info("Bắt đầu crawl tin tức từ nhkeasier.com...");
        try {
            Document homeDoc = Jsoup.connect(NHK_EASIER_URL).userAgent("Mozilla/5.0").get();
            Elements articles = homeDoc.select("article");
            
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
                
                crawlAndSaveArticle(newsId, title, articleUrl, false);
                count++;
            }
            log.info("Hoàn tất crawl tin tức NHKEasier.");

        } catch (Exception e) {
            log.error("Lỗi khi crawl tin tức NHKEasier: ", e);
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void crawlHistoricalNews(int maxPages) {
        log.info("Bắt đầu crawl lịch sử tin tức từ nhkeasier.com ({} trang)...", maxPages);
        try {
            String currentUrl = NHK_EASIER_URL;
            for (int i = 1; i <= maxPages; i++) {
                if (currentUrl == null || currentUrl.isEmpty()) {
                    log.info("Không tìm thấy link trang tiếp theo. Dừng cào lịch sử.");
                    break;
                }
                
                log.info("Đang quét trang danh sách ({} / {}): {}", i, maxPages, currentUrl);
                Document doc = Jsoup.connect(currentUrl).userAgent("Mozilla/5.0").get();
                Elements articles = doc.select("article");
                
                for (Element articleElement : articles) {
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
                    
                    crawlAndSaveArticle(newsId, title, articleUrl, true); // SKIP AI for historical
                    Thread.sleep(500); // Prevent DDoS ban
                }
                
                // Find next page link
                Element olderStoriesLink = doc.selectFirst("a:contains(Older stories)");
                if (olderStoriesLink != null) {
                    currentUrl = olderStoriesLink.attr("href");
                    if (currentUrl.startsWith("/")) {
                        currentUrl = "https://nhkeasier.com" + currentUrl;
                    }
                } else {
                    currentUrl = null;
                }
                
                Thread.sleep(1000); // Sleep between pages
            }
            log.info("Hoàn tất crawl {} trang lịch sử.", maxPages);
        } catch (Exception e) {
            log.error("Lỗi khi crawl tin tức lịch sử: ", e);
        }
    }

    private void crawlAndSaveArticle(String newsId, String fallbackTitle, String articleUrl, boolean skipAi) {
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

            Element dateElement = contentDiv.selectFirst("h4");
            LocalDateTime publishedAt = LocalDateTime.now();
            if (dateElement != null) {
                String dateText = dateElement.text().trim();
                if (dateText.length() >= 19) {
                    try {
                        String dateTimeStr = dateText.substring(0, 19);
                        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                        publishedAt = LocalDateTime.parse(dateTimeStr, formatter);
                    } catch (Exception e) {
                        log.warn("Không thể parse ngày tháng: " + dateText);
                    }
                }
            }

            contentDiv.select("h3, h4, img, audio, table, nav").remove();

            StringBuilder contentWithFurigana = new StringBuilder();
            StringBuilder contentRaw = new StringBuilder();

            Elements paragraphs = contentDiv.select("p");
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
            article.setPublishedAt(publishedAt);
            
            if (!skipAi) {
                try {
                    log.info("Đang dùng AI trích xuất từ vựng và dịch cho bài: " + newsId);
                    
                    String translation = aiService.generateContent("Dịch bài báo tiếng Nhật sau sang tiếng Việt tự nhiên và dễ hiểu, chỉ trả về nội dung dịch, không có bất kỳ giải thích nào khác:\n\n" + contentRaw.toString(), 2500);
                    article.setTranslation(translation);

                    String extractedVocab = aiService.extractVocabularyFromNews(contentRaw.toString());
                    article.setExtractedVocab(extractedVocab);

                    if (extractedVocab != null && !extractedVocab.trim().isEmpty() && !extractedVocab.equals("[]")) {
                        log.info("Đã trích xuất từ vựng thành công cho bài: " + newsId);
                    }
                } catch (Exception aiError) {
                    log.error("Lỗi khi AI xử lý bài: " + newsId, aiError);
                }
            } else {
                article.setExtractedVocab("[]"); // Empty vocab for historical to save time
            }

            newsArticleRepository.save(article);
            log.info("Lưu thành công bài báo: " + newsId);

            try {
                notificationService.broadcastNewArticle(article);
            } catch (Exception ex) {
                log.error("Lỗi khi gửi thông báo tin tức mới: ", ex);
            }

        } catch (Exception e) {
            log.error("Lỗi khi crawl bài báo ID: " + newsId, e);
        }
    }
}
