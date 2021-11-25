# -*- coding: utf-8 -*-
"""LC_Sesion2.ipynb

"""

# LC
# LAB - Sesion 2
# Ejer 1
# Jose Javier Calvo Moratilla
# NLTK

#import nltk
#nltk.download()

# The cess corpus annotated with morphosyntactic information is used.

# Import libraries
import nltk
nltk.download('cess_esp')
nltk.download('punkt')
from nltk.corpus import cess_esp
from nltk.tag import hmm, tnt
from tqdm import tqdm
import numpy as np
from sklearn.model_selection import KFold 
import matplotlib.pyplot as plt

import warnings
warnings.filterwarnings("ignore")

# 1a.Download the dirty corpus 
corpus=cess_esp.tagged_sents()

# Vars
corpus_cleaned = []
corpus_train = []
corpus_test = []
model_selec = ''

results = []
intervalos_conf = []


def preproces():
    """
    The corpus is preprocessed to simplify the labels
    """
    # 1b.Preprocess corpus
    for sentence in tqdm(corpus):
        list_cleaned = []
        for word, cat in sentence:    

            if not word.startswith('*0*'): 

                if cat.startswith('v') | cat.startswith('F'):       
                    list_cleaned.append((word, cat[0:3]))        
                elif len(cat) == 1:
                    list_cleaned.append((word, cat[0:1]))            
                else:        
                    list_cleaned.append((word, cat[0:2]))   

        corpus_cleaned.append(list_cleaned) 
      
    

def holdout(valor):
    """
    The data are divided into training and test segments.
    """
    reference = int(len(corpus_cleaned)*valor)    
    corpus_train = corpus_cleaned[:reference]
    corpus_test = corpus_cleaned[reference:]
    return corpus_train, corpus_test

# 2a.Entrenamiento etiquetador elegido hmm o tnt
def train(train_data, model = 'hmm'):
    """
    Training of the selected model is performed
    """         
    if model =='hmm':
        model_trained = hmm.HiddenMarkovModelTagger.train(train_data)

    elif model == 'tnt':
        model_trained = tnt.TnT()        
        model_trained.train(train_data)        
    else:
        raise ValueError("El modelo seleccionado no existe")
    return model_trained

# 2c.Evaluar las prestaciones del etiquetador

print('\n Se inicia la ejecución del ejercicio de la sesión nº2...\n')
print('Qué modelo quieres utilizar? hmm o tnt \n')
model_selec = input()

print('\nSe preprocesa el corpus...\n')
preproces()

print('\n Se realiza el Ten-fold cross validation... \n')
iter = 1
splits = 10
kf = KFold(n_splits=splits, shuffle = True)
for train_indexes, test_indexes in kf.split(corpus_cleaned):
  print('Iteración: ', iter, ' de: ', splits)

  train_data = np.array(corpus_cleaned)[train_indexes.astype(int)]
  test_data = np.array(corpus_cleaned)[test_indexes.astype(int)]

  model = train(train_data, model_selec)
  ac = model.evaluate(test_data)  
  ic = 1.96 * np.sqrt((ac*(1-ac))/len(test_data))
  results.append(ac)
  intervalos_conf.append(ic)
  iter += 1

x=[i for i in range(10)]
y=results
plt.axis([-1, 10, 0.75, 1.0])
plt.ylabel('Accuracy')
plt.xlabel('Fold')
plt.title('Ten-fold cross validation')
plt.plot(x,y,'ro')
plt.errorbar(x,y,yerr=ic,linestyle='None')
plt.show()
plt.savefig(model_selec + '.png')
print('results: ', results)
print('IC: ', ic)