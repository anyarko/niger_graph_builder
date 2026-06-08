extractDocxText <- function(docx.path, out.path){
  cat("Extracting", docx.path, "...\n")
  tmp.dir <- tempdir()
  unzip(docx.path, exdir = tmp.dir)
  xml.path <- file.path(tmp.dir, "word", "document.xml")
  
  if(file.exists(xml.path)){
    text <- readLines(xml.path, warn = FALSE)
    text <- paste(text, collapse = " ")
    text <- gsub("<[^>]+>", "|", text)
    text <- strsplit(text, "\\|")[[1]]
    text <- text[text != "" & text != " "]
    writeLines(text, out.path)
    cat("Successfully extracted text to", out.path, "\n")
  } else {
    cat("Failed to find document.xml in", docx.path, "\n")
  }
}

extractDocxText("../Key Vulnerability Questions.docx", "raw_text_en.txt")
extractDocxText("../Translated - Sibling Method Survey Questions.docx", "raw_text_fr.txt")
