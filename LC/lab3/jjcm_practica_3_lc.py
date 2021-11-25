# -*- coding: utf-8 -*-
"""JJCM Practica 3 LC.ipynb

1) Implementar,	usando NLTK	 y	 Python,	 el	 algoritmo	 de	 Lesk	 simplificado	 para	
desambiguar	el	 sentido	 de	las	 palabras	 (WSD).	 La	 función	 recibirá	 una	 palabra	 y	
una	 frase	que	la	contenga	y	decidirá	el	mejor	sentido	para	esa	palabra.	Las	 frases	
serán	en	inglés	 y	 se	 deberá	eliminar	de	la	 frase, de	la	glosa	 y de	los ejemplos	 de	
cada	sentido	las	‘stopwords’
"""

# Imports
#!pip install nltk
import nltk
from nltk.corpus import wordnet as wn
from nltk.corpus import stopwords as sw
nltk.download('omw')
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Obtain English Stop Words 
sw_english=sw.words('english')

def compute_overlap(contexto, sign):
  return len(contexto.intersection(sign))

def lematizacion(frase):  
    sentence_lematized = []  
    for w in frase:
      sentence_lematized.append(wn.morphy(w))
    return sentence_lematized

def simplified_lesk(word, sentence):
  
  overlap = 0
  max_overlap = 0

  # Senses 
  senses=wn.synsets(word)  
  best_sense = senses

  # Tokenizado
  sentence_tokenized = nltk.word_tokenize(sentence) 

  # lematizacion
  sentence_tokenized_lematized = lematizacion(sentence_tokenized)
  context = set(sentence_tokenized_lematized)

  # Quitamos Stop Words
  context = context.difference(sw_english)

  for sense in senses[1:]:
    signature = set(lematizacion(nltk.word_tokenize(sense.definition().join(sense.examples()))))
    signature = signature.difference(sw_english)
    overlap = compute_overlap(context, signature)
    if overlap > max_overlap:
      max_overlap = overlap
      best_sense = sense

  return best_sense


#simplified_lesk('bank', 'Hi, mi name is Jose Javier and i want go to bank')
simplified_lesk('bank', 'Yesterday	I	went to	the	bank to withdraw the	money and the	credit	card did	not	work')

"""2)	Implementar un	algoritmo	similar	para	la	desambiguación	semántica	utilizando	
Word Embeddings	y	una	distancia	de	similitud	semántica como	la	distancia	coseno
"""

#Imports
# Word embeddings
import gensim
from nltk.data import find
import nltk
import numpy as np

nltk.download('word2vec_sample')
word2vec_sample = str(find('models/word2vec_sample/pruned.word2vec.txt'))
model = gensim.models.KeyedVectors.load_word2vec_format(word2vec_sample, binary=False)

def lematizacion(frase):  
    sentence_lematized = []  
    for w in frase:
      sentence_lematized.append(wn.morphy(w))
    return sentence_lematized

def computeDistance(contexto, sentido):
  res = 0.0
  for token_c in contexto:
    for token_s in sentido:
      #print(token_c)
      #print(token_s)
      res += model.similarity(token_c,token_s)
  return res

def desambiguar(word, sentence):
  
  # Senses 
  senses=wn.synsets(word)  
  best_sense = []
  max_similitud = 0.0

  # Tokenizado
  sentence_tokenized_con_sw = set(nltk.word_tokenize(sentence)) 
  sentence_tokenized_sin_sw = sentence_tokenized_con_sw.difference(sw_english)

  # lematizacion
  sentence_tokenized_lematized = lematizacion(sentence_tokenized_sin_sw)
  context = set(sentence_tokenized_lematized)

  if len(context.intersection({None})) > 0:    
    context.remove(None)

  for sense in senses[1:]:

    signature_con_sw = set(nltk.word_tokenize(sense.definition().join(sense.examples())))
    signature_sin_sw = signature_con_sw.difference(sw_english)
    signature = set(lematizacion(signature_sin_sw))    

    if len(signature.intersection({None})) > 0:
      signature.remove(None)

    similitud = computeDistance(context, signature)
    if similitud > max_similitud:
      max_similitud = similitud
      best_sense = sense

  return best_sense

desambiguar('bank', 'Yesterday	I	went to	the	bank to withdraw the	money and the	credit	card did	not	work')