text <- readLines("docx_unzipped/word/document.xml", warn = FALSE)
text <- paste(text, collapse = " ")
text <- gsub("<[^>]+>", "|", text) # replace tags with |
text <- strsplit(text, "\\|")[[1]]
text <- text[text != "" & text != " "]
cat(paste(text, collapse = "\n"))
