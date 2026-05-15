package com.nihongo.practice_nihongo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class PracticeNihongoApplication {

	public static void main(String[] args) {
		try {
			String currentDir = System.getProperty("user.dir");
			java.io.File envFile = new java.io.File(currentDir, ".env");
			String targetDir = envFile.exists() ? currentDir : currentDir + "/..";
			
			Dotenv dotenv = Dotenv.configure()
				.directory(targetDir)
				.ignoreIfMissing()
				.load();

			dotenv.entries().forEach(entry -> {
				System.setProperty(entry.getKey(), entry.getValue());
			});
		} catch (Exception e) {
			System.out.println(">>> Exception loading .env: " + e.getMessage());
		}

		String apiKey = System.getProperty("GEMINI_API_KEY");

		SpringApplication.run(PracticeNihongoApplication.class, args);
	}
}
