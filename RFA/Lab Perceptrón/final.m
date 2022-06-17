#!/usr/bin/octave -qf

% Perceptron, creación matriz de pesos W y obtencion tasa error e interval de confianza
% José Javier Calvo Moratilla
% MUIARFID 2021

% use: octave final.m 

printf("Se inicia el proceso de generación de w y evaluacion\n");


% Iterate to experiment with each dataset
dataSets = {'OCR_14x14.gz', 'expressions.gz', 'gauss2D.gz', 'gender.gz', 'iris.gz', 'news.gz' , 'videos.gz'};

% Each dataset have their own parameter b
b =[100000.0 100000.0 100000.0 100000.0 100000.0 10000.0 10000.0]; %EDITARRRR mejores valores
a = [100.0 10.0 100.0 100.0 100000.0 100.0 100000.0]; %EDITAR mejores valores


for dataSet = 1:length(dataSets)
    % printf('%i\n',dataSet);
    selec = dataSets{dataSet}
    printf("# b a E k Ete \n");
    printf("#------- --- --- --- --- ---------\n");

    % Load Dataset and use perceptron with parameter b
    load(selec);
    [N,L]=size(data);
    [w,E,k]=perceptron(data, b(dataSet), a(dataSet));
    printf("%8.1f %8.1f %3d %3d \n",b(dataSet),a(dataSet),E,k);

    % Se guarda la matriz de pesos de la última iteración
    save(strcat(selec,"_W"),"w");     
    
end
printf("\nSe acaba el proceso de generación de w y evaluacion\n ");
