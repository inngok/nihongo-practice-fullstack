package com.nihongo.practice_nihongo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class PracticeNihongoApplication {

	public static void main(String[] args) {
		try {
			Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();
			dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		} catch (Exception e) {
			System.out.println(".env file not found or could not be loaded, skipping.");
		}
		String apiKey = System.getProperty("GEMINI_API_KEY");
		if (apiKey != null && apiKey.length() > 5) {
			System.out.println(">>> GEMINI_API_KEY loaded successfully (starts with: " + apiKey.substring(0, 5) + "...)");
		} else {
			System.err.println(">>> ERROR: GEMINI_API_KEY not found in .env or environment variables!");
		}

		SpringApplication.run(PracticeNihongoApplication.class, args);
	}
}
