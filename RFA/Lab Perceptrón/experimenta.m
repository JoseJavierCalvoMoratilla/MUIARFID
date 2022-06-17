#!/usr/bin/octave -qf

% Perceptron Experiment
% José Javier Calvo Moratilla
% MUIARFID 2021

% use: octave experimenta.m >> res_experiment.out & tail -f res_experiment.out

% Iterate to experiment with each dataset
%dataSets = {'OCR_14x14.gz', 'expressions.gz', 'gauss2D.gz', 'gender.gz', 'iris.gz', 'news.gz' , 'videos.gz'};
dataSets = {'news.gz' , 'videos.gz'};
for dataSet = 1:length(dataSets)
selec = dataSets{dataSet} 
% Load Dataset, collec their sizes and labels
load(selec); [N,L]=size(data); D=L-1;
ll=unique(data(:,L)); C=numel(ll);

% Mixture of data with a seed to do experiments
% 70% of data to train, 30% of data to test
rand("seed",23); data=data(randperm(N),:);
NTr=round(.7*N); M=N-NTr; te=data(NTr+1:N,:);

% Experiment with parameter b
printf("# b a E k Ete Intervalo\n");
printf("#------- --- --- --- --- ---------\n");
for b=[.1 1 10 100 1000 10000 100000]
for a=[.1 1 10 100 1000 10000 100000]
[w,E,k]=perceptron(data(1:NTr,:),b,a); rl=zeros(M,1);
for n=1:M rl(n)=ll(linmach(w,[1 te(n,1:D)]')); end
[nerr m]=confus(te(:,L),rl);
output_precision(2);
m=nerr/M;
s=sqrt(m*(1-m)/M);
r=1.96*s;
printf("%8.1f %8.1f %3d %3d %3d I=[%.3f, %.3f] \n",b,a,E,k,nerr,m-r,m+r);
end
end
end % End datasets