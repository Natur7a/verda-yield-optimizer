import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getMills } from '@/lib/mockData';
import { useMemo } from 'react';

export const MillsTable = () => {
  const mills = useMemo(() => getMills(), []);

  return (
    <Card className="border-border/50 gradient-card">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-lg font-semibold text-foreground">
          Connected Mills
        </CardTitle>
        <p className="text-sm text-muted-foreground">Real-time mill performance overview</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Mill</TableHead>
                <TableHead className="text-muted-foreground">Location</TableHead>
                <TableHead className="text-muted-foreground text-right">Capacity</TableHead>
                <TableHead className="text-muted-foreground text-right">Current</TableHead>
                <TableHead className="text-muted-foreground">Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mills.map((mill) => (
                <TableRow key={mill.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{mill.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {mill.location}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {mill.capacity} t/hr
                  </TableCell>
                  <TableCell className="text-right text-foreground font-medium">
                    {mill.currentYield} t/hr
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={mill.efficiency} 
                        className="h-2 w-20"
                      />
                      <span className="text-sm font-medium text-foreground w-10">
                        {mill.efficiency}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
